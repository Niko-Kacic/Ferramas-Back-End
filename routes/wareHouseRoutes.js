import express from 'express';
import {getAllWarehouses,
        createWarehouse,
        updateWarehouse,
        deleteWarehouse
} from '../controllers/warehouse/index.js'


const router = express.Router();

router.get('/', getAllWarehouses);
router.post('/', createWarehouse);
router.put('/:id', updateWarehouse);
router.delete('/:id', deleteWarehouse);

export default router;