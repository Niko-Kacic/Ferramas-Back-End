
import express from 'express';
import { getPurchaseLogsByClient } from '../controllers/receip/index.js';

const router = express.Router();

router.get('/:clientId', getPurchaseLogsByClient);

export default router;
