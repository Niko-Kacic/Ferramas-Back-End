// controllers/cartController.js
import pool from '../../models/db.js';

// Crear un nuevo carrito para un cliente
export const createCart = async (req, res) => {
  const { client_id } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO cart (client_id) VALUES (?)',
      [client_id]
    );
    res.status(201).json({ cart_id: result.insertId });
  } catch (error) {
    console.error('Error creando carrito:', error);
    res.status(500).json({ error: 'Error creando carrito' });
  }
};

// Agregar un producto al carrito
export const addItemToCart = async (req, res) => {
  const { cartId } = req.params;
  const { product_id, quantity, unit_price } = req.body;
  try {
    await pool.query(
      'INSERT INTO cart_items (cart_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
      [cartId, product_id, quantity, unit_price]
    );
    res.status(201).json({ message: 'Producto agregado al carrito' });
  } catch (error) {
    console.error('Error agregando producto al carrito:', error);
    res.status(500).json({ error: 'Error agregando producto al carrito' });
  }
};

// Actualizar cantidad/precio de un producto en el carrito
export const updateCartItem = async (req, res) => {
  const { cartId, productId } = req.params;
  const { quantity, unit_price } = req.body;
  try {
    await pool.query(
      'UPDATE cart_items SET quantity = ?, unit_price = ? WHERE cart_id = ? AND product_id = ?',
      [quantity, unit_price, cartId, productId]
    );
    res.json({ message: 'Producto actualizado en el carrito' });
  } catch (error) {
    console.error('Error actualizando producto:', error);
    res.status(500).json({ error: 'Error actualizando producto' });
  }
};

// Eliminar un producto del carrito
export const deleteCartItem = async (req, res) => {
  const { cartId, productId } = req.params;
  try {
    await pool.query(
      'DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?',
      [cartId, productId]
    );
    res.json({ message: 'Producto eliminado del carrito' });
  } catch (error) {
    console.error('Error eliminando producto del carrito:', error);
    res.status(500).json({ error: 'Error eliminando producto del carrito' });
  }
};

// Eliminar un carrito completo
export const deleteCart = async (req, res) => {
  const { cartId } = req.params;
  try {
    await pool.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
    await pool.query('DELETE FROM cart WHERE cart_id = ?', [cartId]);
    res.json({ message: 'Carrito eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando carrito:', error);
    res.status(500).json({ error: 'Error eliminando carrito' });
  }
};

// Obtener productos del carrito
export const getCartItems = async (req, res) => {
  const { cartId } = req.params;
  try {
    const [items] = await pool.query(
      `SELECT ci.product_id, p.product_name, ci.quantity, ci.unit_price
       FROM cart_items ci
       JOIN product p ON ci.product_id = p.product_id
       WHERE ci.cart_id = ?`,
      [cartId]
    );
    res.json(items);
  } catch (error) {
    console.error('Error obteniendo productos del carrito:', error);
    res.status(500).json({ error: 'Error obteniendo productos del carrito' });
  }
};
