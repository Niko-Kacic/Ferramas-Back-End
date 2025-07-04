import express from 'express';
import {
  createCart,
  addItemToCart,
  updateCartItem,
  deleteCartItem,
  deleteCart,
  getCartItems,
  getCartByClientId,
  confirmPurchase
} from '../controllers/cart/cartController.js';

const router = express.Router();

// Obtener el carrito de un cliente específico
router.get('/client/:clientId', getCartByClientId);

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

// Confirmar compra y generar boleta
router.post('/:cartId/confirm', confirmPurchase);

export default router;
