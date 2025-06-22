import express from 'express';
import {
  createDelivery,
  getDeliveryByCart,
  updateDeliveryStatus
} from '../controllers/deliveryController/index.js';

const router = express.Router();

router.post('/', createDelivery); // POST /api/delivery
router.get('/:cartId', getDeliveryByCart); // GET /api/delivery/:cartId
router.put('/:cartId/status', updateDeliveryStatus); // PUT /api/delivery/:cartId/status

export default router;