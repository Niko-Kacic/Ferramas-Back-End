import express from 'express';
import { 
    getAllProducts, 
    getProductById, 
    insertProduct, 
    updateProduct, 
    deleteProduct} from '../controllers/product/index.js';


const router = express.Router();

//Ruta para GET
router.get('/', getAllProducts);
router.get('/:id', getProductById);

//Metodo POST
router.post('/', insertProduct);

//Metodo UPDATE
router.put('/:id', updateProduct);

//Metodo DELETE
router.delete('/:id', deleteProduct);


export default router;
