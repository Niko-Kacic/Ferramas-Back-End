import express from 'express';
import { initPayment, confirmPayment } from '../controllers/payment/paymentController.js'; 

const router = express.Router();

// Resultado: POST http://localhost:3000/api/payments/pay
router.post('/pay', initPayment);


// Resultado: POST http://localhost:3000/api/payments/confirm
router.post('/confirm', confirmPayment);

router.get('/confirm', (req, res) => {
  const token = req.query.token_ws;
  res.redirect(`http://localhost:5173/confirm?token_ws=${token}`);
});

router.get('/reject', (req, res) => {
  res.redirect('http://localhost:5173/reject');
});
export default router;
