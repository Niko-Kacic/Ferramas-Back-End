import express from 'express';
import {getAllWarehouses,
        createWarehouse,
        updateWarehouse,
        deleteWarehouse
} from '../controllers/warehouse/index.js'
import{ addStock,
        updateStock,
        getStockByWarehouse
} from '../controllers/warehouse/index.js'

const router = express.Router();

router.get('/', getAllWarehouses);
router.post('/', createWarehouse);
router.put('/:id', updateWarehouse);
router.delete('/:id', deleteWarehouse);


router.post('/stock', addStock); 
router.put('/stock/:warehouse_id/:product_id', updateStock);
router.get('/stock/:warehouse_id', getStockByWarehouse);

export default router;