import express from 'express';
import {
  createCart,
  addItemToCart,
  updateCartItem,
  deleteCartItem,
  deleteCart,
  getCartItems
} from '../controllers/cart/cartController.js';

const router = express.Router();

// Crear un nuevo carrito
router.post('/', createCart);

// Obtener los productos de un carrito específico
router.get('/:cartId/items', getCartItems);

// Agregar un producto al carrito
router.post('/:cartId/items', addItemToCart);

// Actualizar cantidad o precio de un producto en el carrito
router.put('/:cartId/items/:productId', updateCartItem);

// Eliminar un producto específico del carrito
router.delete('/:cartId/items/:productId', deleteCartItem);

// Eliminar todo el carrito
router.delete('/:cartId', deleteCart);

export default router;
