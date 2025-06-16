import { WebpayPlus } from 'transbank-sdk';

WebpayPlus.configureForTesting(); // modo sandbox

export const initPayment = async (req, res) => {
  try {
    const { cartId, amount } = req.body;

    const buyOrder = `ORD-${cartId}-${Date.now()}`;
    const sessionId = `SESSION-${cartId}-${Date.now()}`;

    const returnUrl = 'http://localhost:3000/api/payments/confirm'; // Cambia al usar frontend (Que Alan viene haciendo hace semanas y aun no lo termina)

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

    // Aquí podrías insertar el resultado en payment_detail y dejar que los triggers actúen

    res.json({
      message: 'Pago confirmado',
      response
    });
  } catch (error) {
    console.error('Error confirmando el pago:', error);
    res.status(500).json({ error: 'Error al confirmar el pago' });
  }
};
