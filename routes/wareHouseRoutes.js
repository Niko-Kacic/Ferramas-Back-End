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


router.post('/', addStock); 
router.put('/:warehouse_id/:product_id', updateStock); 
router.get('/:warehouse_id', getStockByWarehouse); 

export default router;