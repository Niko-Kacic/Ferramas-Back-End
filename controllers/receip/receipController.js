// controllers/receiptController.js
import pool from '../../models/db.js';

export const getReceiptsByClient = async (req, res) => {
  try {
    const { clientId } = req.params;

    const [receipts] = await pool.query(
      'SELECT * FROM receipt WHERE client_id = ? ORDER BY issued_at DESC',
      [clientId]
    );

    res.json(receipts);
  } catch (error) {
    console.error('Error obteniendo boletas:', error);
    res.status(500).json({ error: 'Error al obtener boletas' });
  }
};


// controllers/receiptController.js
export const getReceiptDetails = async (req, res) => {
  try {
    const { receiptId } = req.params;

    const [details] = await pool.query(
      `SELECT product_name, quantity, unit_price
       FROM receipt_detail
       WHERE receipt_id = ?`,
      [receiptId]
    );

    res.json(details);
  } catch (error) {
    console.error('Error obteniendo detalle de boleta:', error);
    res.status(500).json({ error: 'Error al obtener detalle' });
  }
};


// controllers/purchaseLogController.js
export const getPurchaseLogsByClient = async (req, res) => {
  try {
    const { clientId } = req.params;

    const [logs] = await pool.query(
      `SELECT log_id, cart_id, payment_amount, payment_method, payment_status, log_created_at
       FROM purchase_log
       WHERE client_id = ?
       ORDER BY log_created_at DESC`,
      [clientId]
    );

    res.json(logs);
  } catch (error) {
    console.error('Error obteniendo logs:', error);
    res.status(500).json({ error: 'Error al obtener logs de compra' });
  }
};
