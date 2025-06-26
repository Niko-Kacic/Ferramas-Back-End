import pkg from 'transbank-sdk';
const { Options, WebpayPlus, Environment, IntegrationCommerceCodes, IntegrationApiKeys } = pkg;
import pool from '../../models/db.js';
import dotenv from 'dotenv';

dotenv.config();

//regresión y clasificación
const tx = new WebpayPlus.Transaction(
  new Options(
    IntegrationCommerceCodes.WEBPAY_PLUS, 
    '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C', // API Key manual
    Environment.Integration
  )
);

// Controlador para iniciar el pago
export const initPayment = async (req, res) => {
  try {
    const { cartId } = req.body;
    const [[totalResult]] = await pool.query(`SELECT SUM(quantity * unit_price) AS total FROM cart_items WHERE cart_id = ?`, [cartId]);
    const amount = totalResult?.total;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Carrito vacío o monto inválido.' });
    }

    const createResponse = await tx.create(
      `ORD-${cartId}-${Date.now()}`,
      `SESSION-${cartId}-${Date.now()}`,
      amount,
      'http://localhost:3000/api/payments/confirm'
    );

    res.json({ token: createResponse.token, url: createResponse.url });
  } catch (error) {
    console.error('Detalle del error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Error al iniciar pago', details: error.message });
  }
};

// Controlador para confirmar el pago
export const confirmPayment = async (req, res) => {
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const token = req.body.token_ws;

    // 1. Confirmar transacción con Webpay
    const commitResponse = await tx.commit(token);

    const {
      buy_order,
      session_id,
      amount,
      card_detail,
      transaction_date,
      status
    } = commitResponse;

    const cartId = parseInt(buy_order.split('-')[1]);

    // 2. Obtener cliente asociado al carrito
    const [[cart]] = await connection.query(
      'SELECT client_id FROM cart WHERE cart_id = ?',
      [cartId]
    );

    const clientId = cart?.client_id;
    if (!clientId) {
      await connection.rollback();
      return res.status(404).json({ error: 'Cliente no encontrado para este carrito' });
    }

    // 3. Validar estado de pago
    const [[statusRow]] = await connection.query(
      'SELECT status_id FROM payment_status WHERE status_code = ?',
      [status]
    );

    const status_id = statusRow?.status_id;
    if (!status_id) {
      await connection.rollback();
      return res.status(400).json({ error: 'Estado de pago no válido.' });
    }

    // 4. Verificar monto real del carrito
    const [[{ total }]] = await connection.query(
      `SELECT SUM(ci.quantity * ci.unit_price) AS total
       FROM cart_items ci
       WHERE ci.cart_id = ?`,
      [cartId]
    );

    if (!total || parseFloat(total) !== parseFloat(amount)) {
      await connection.rollback();
      return res.status(400).json({
        error: 'El monto no coincide con el contenido real del carrito',
        carrito_total: total,
        recibido_por_webpay: amount
      });
    }

    // 5. Insertar en payment_detail
    const [paymentResult] = await connection.query(
      `INSERT INTO payment_detail (
        cart_id,
        payment_amount,
        payment_method,
        status_id,
        payment_time
      ) VALUES (?, ?, ?, ?, NOW())`,
      [cartId, amount, card_detail?.card_number || 'N/A', status_id]
    );

    const payment_detail_id = paymentResult.insertId;

    // 6. Obtener productos del carrito
    const [items] = await connection.query(
      `SELECT ci.product_id, ci.quantity, p.product_name, p.price_product
       FROM cart_items ci
       JOIN product p ON ci.product_id = p.product_id
       WHERE ci.cart_id = ?`,
      [cartId]
    );

    if (items.length === 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'El carrito está vacío' });
    }

    // 7. Crear boleta
    const [receiptResult] = await connection.query(
      `INSERT INTO receipt (client_id, total_amount)
       VALUES (?, ?)`,
      [clientId, amount]
    );

    const receiptId = receiptResult.insertId;

    // 8. Insertar detalle de boleta
    for (const item of items) {
      await connection.query(
        `INSERT INTO receipt_detail (
          receipt_id,
          product_id,
          product_name,
          quantity,
          unit_price
        ) VALUES (?, ?, ?, ?, ?)`,
        [
          receiptId,
          item.product_id,
          item.product_name,
          item.quantity,
          item.price_product
        ]
      );
    }

    // 9. Actualizar estado de delivery si corresponde
    const [[delivery]] = await connection.query(
      'SELECT is_delivery FROM delivery WHERE cart_id = ?',
      [cartId]
    );

    if (delivery?.is_delivery) {
      await connection.query(
        `UPDATE delivery SET delivery_status = 'bought' WHERE cart_id = ?`,
        [cartId]
      );
    }

    // 10. Insertar en purchase_log
    await connection.query(
      `INSERT INTO purchase_log (
        client_id, client_name, client_surname, client_email, phone_number,
        cart_id, payment_detail_id, payment_amount, payment_method,
        payment_time, payment_status
      )
      SELECT c.client_id, c.client_name, c.client_surname, c.client_email, c.phone_number,
             ?, ?, ?, ?, NOW(), ?
      FROM client c
      WHERE c.client_id = ?`,
      [
        cartId,
        payment_detail_id,
        amount,
        card_detail?.card_number || 'N/A',
        status,
        clientId
      ]
    );

    // 11. Limpiar carrito
    await connection.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);

    await connection.commit();

    res.status(201).json({
      message: 'Pago confirmado, boleta generada, delivery actualizado y carrito limpiado.',
      receipt_id: receiptId,
      payment_detail_id
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error confirmando el pago:', error);
    res.status(500).json({ error: 'Error al confirmar el pago' });
  } finally {
    connection.release();
  }
};


console.log("Configuración de Webpay:", {
  commerceCode: IntegrationCommerceCodes.WEBPAY_PLUS,
  apiKey: '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C', // Hardcodeada
  environment: Environment.Integration
});