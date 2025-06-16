import express from 'express';
import { initPayment, confirmPayment } from '../controllers/payment/paymentController';

const router = express.Router();

router.post('/pay', initPayment);         // iniciar compra
router.post('/payments/confirm', confirmPayment); // confirmar compra

export default router;