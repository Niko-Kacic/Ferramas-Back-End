import pool from '../../models/db.js';
import dotenv from 'dotenv';
dotenv.config();

import pkg from 'transbank-sdk';
const { WebpayPlus } = pkg;


export const initPayment = async (req, res) => {
    try {
        const { cartId, amount } = req.body;

        const buyOrder = `ORD-${cartId}-${Date.now()}`; // Identificador único
        const sessionId = `SESSION-${cartId}-${Date.now()}`;
        const returnUrl = 'http://localhost:3000/api/payments/confirm';

        const transaction = await WebpayPlus.Transaction.create(
            buyOrder,
            sessionId,
            amount,
            returnUrl
        );

        res.json({
            token: transaction.token,
            url: transaction.url
        });
    } catch (error) {
        console.error('Error iniciando el pago:', error);
        res.status(500).json({ error: 'Error al iniciar el pago' });
    }
};


export const confirmPayment = async (req, res) => {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
        const token = req.body.token_ws;
        const response = await WebpayPlus.Transaction.commit(token);

        const {
            buy_order,
            session_id,
            amount,
            card_detail,
            transaction_date,
            status
        } = response;

        const cartId = parseInt(buy_order.split('-')[1]);

        const [[cart]] = await connection.query(
            'SELECT client_id FROM cart WHERE cart_id = ?',
            [cartId]
        );
        const clientId = cart?.client_id;

        if (!clientId) {
            await connection.rollback();
            return res.status(404).json({ error: 'Cliente no encontrado para este carrito' });
        }

        const [[statusRow]] = await connection.query(
            'SELECT status_id FROM payment_status WHERE status_code = ?',
            [status]
        );
        const status_id = statusRow?.status_id;

        if (!status_id) {
            await connection.rollback();
            return res.status(400).json({ error: 'Estado de pago no válido.' });
        }

        // 1. Registrar el detalle del pago
        await connection.query(
            `INSERT INTO payment_detail (cart_id, payment_amount, payment_method, status_id, payment_time)
             VALUES (?, ?, ?, ?, NOW())`,
            [cartId, amount, card_detail.card_number || 'N/A', status_id]
        );

        // 2. Obtener los productos del carrito
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

        // 3. Crear la boleta
        const [receiptResult] = await connection.query(
            `INSERT INTO receipt (client_id, total_amount)
             VALUES (?, ?)`,
            [clientId, amount]
        );

        const receiptId = receiptResult.insertId;

        // 4. Insertar los detalles de la boleta
        for (const item of items) {
            await connection.query(
                `INSERT INTO receipt_detail (receipt_id, product_id, product_name, quantity, unit_price)
                 VALUES (?, ?, ?, ?, ?)`,
                [
                    receiptId,
                    item.product_id,
                    item.product_name,
                    item.quantity,
                    item.price_product
                ]
            );
        }

        // 5. (Opcional) Limpiar carrito
        await connection.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);

        await connection.commit();

        res.json({
            message: 'Pago confirmado, boleta generada y carrito limpiado.',
            receipt_id: receiptId
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error confirmando el pago:', error);
        res.status(500).json({ error: 'Error al confirmar el pago' });
    } finally {
        connection.release();
    }
};
