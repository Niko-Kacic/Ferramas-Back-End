import express from 'express';
import {
  getReceiptsByClient,
  getReceiptDetails, // 
  getPurchaseLogsByClient
} from '../controllers/receip/index.js';


const router = express.Router();

// Obtener boletas por cliente
router.get('/:clientId', getReceiptsByClient);

// Obtener detalle de una boleta específica
router.get('/detail/:receipId', getReceiptDetails);

export default router;
