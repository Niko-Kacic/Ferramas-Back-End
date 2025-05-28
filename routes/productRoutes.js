import express from 'express';
import { getAllProducts, getProductById ,insertProduct } from '../controllers/productControllers.js';

const router = express.Router();

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', insertProduct);

export default router;
