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
    try {
        const token = req.body.token_ws;
        const response = await WebpayPlus.Transaction.commit(token);

        // Extraer datos necesarios
        const {
            buy_order,
            session_id,
            amount,
            card_detail,
            accounting_date,
            transaction_date,
            status
        } = response;

        // Extraer cart_id desde buy_order
        const cartId = parseInt(buy_order.split('-')[1]);

        // Obtener el status_id desde la tabla payment_status
        const statusResult = await pool.query(
            'SELECT status_id FROM payment_status WHERE status_code = ?',
            [status]
        );

        const status_id = statusResult[0]?.status_id;

        if (!status_id) {
            return res.status(400).json({ error: 'Estado de pago no válido.' });
        }

        // Insertar en payment_detail
        await pool.query(
            `INSERT INTO payment_detail (
                cart_id,
                payment_amount,
                payment_method,
                status_id,
                payment_time
            ) VALUES (?, ?, ?, ?, NOW())`,
            [cartId, amount, card_detail.card_number || 'N/A', status_id]
        );

        res.json({
            message: 'Pago confirmado y registrado en la base de datos.',
            response
        });
    } catch (error) {
        console.error('Error confirmando el pago:', error);
        res.status(500).json({ error: 'Error al confirmar el pago' });
    }
};
