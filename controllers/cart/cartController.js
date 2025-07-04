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
// controllers/cart/cartController.js

export const addItemToCart = async (req, res) => {
  const { cartId } = req.params;
  const { product_id, quantity } = req.body;

  try {
    const warehouseId = 1;

    // Verificar stock
    const [[stockRow]] = await pool.query(
      'SELECT stock FROM warehouse_stock WHERE warehouse_id = ? AND product_id = ?',
      [warehouseId, product_id]
    );

    if (!stockRow || stockRow.stock < quantity) {
      return res.status(400).json({ message: 'Stock insuficiente para el producto' });
    }

    // Obtener precio actual del producto
    const [[product]] = await pool.query(
      'SELECT price_product FROM product WHERE product_id = ?',
      [product_id]
    );

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const unit_price = product.price_product;

    // Verificar si el producto ya está en el carrito
    const [[existing]] = await pool.query(
      'SELECT quantity FROM cart_items WHERE cart_id = ? AND product_id = ?',
      [cartId, product_id]
    );

    if (existing) {
      // Si ya existe, actualiza la cantidad
      const nuevaCantidad = existing.quantity + quantity;

      await pool.query(
        'UPDATE cart_items SET quantity = ?, unit_price = ? WHERE cart_id = ? AND product_id = ?',
        [nuevaCantidad, unit_price, cartId, product_id]
      );
    } else {
      // Si no existe, lo agrega
      await pool.query(
        'INSERT INTO cart_items (cart_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
        [cartId, product_id, quantity, unit_price]
      );
    }

    res.status(201).json({
      message: 'Producto agregado/actualizado en el carrito',
      product_id,
      quantity,
      unit_price
    });
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
      `SELECT 
        ci.cart_item_id,
        ci.product_id,
        ci.quantity,
        ci.unit_price,
        p.product_name,
        pi.image_url
      FROM cart_items ci
      JOIN product p ON ci.product_id = p.product_id
      LEFT JOIN product_image pi ON pi.product_id = p.product_id AND pi.is_main = TRUE
      WHERE ci.cart_id = ?`,
      [cartId]
    );

    const formatted = items.map(item => ({
      cart_item_id: item.cart_item_id, 
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      product: {
        product_name: item.product_name,
        image_url: item.image_url
      }
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error obteniendo productos del carrito:', error);
    res.status(500).json({ error: 'Error obteniendo productos del carrito' });
  }
};


export const getCartByClientId = async (req, res) => {
  const { clientId } = req.params;

  try {
    const [[cart]] = await pool.query(
      'SELECT cart_id FROM cart WHERE client_id = ?',
      [clientId]
    );

    if (!cart) {
      return res.status(404).json({ message: 'Carrito no encontrado' });
    }

    res.json(cart);
  } catch (error) {
    console.error('Error al obtener carrito del cliente:', error);
    res.status(500).json({ error: 'Error al obtener carrito del cliente' });
  }
};

export const confirmPurchase = async (req, res) => {
  const { cartId } = req.params;
  const connection = await pool.getConnection();
  const warehouseId = 1; 

  try {
    await connection.beginTransaction();

    // Obtener todos los productos del carrito
    const [cartItems] = await connection.query(
      'SELECT product_id, quantity FROM cart_items WHERE cart_id = ?',
      [cartId]
    );

    if (cartItems.length === 0) {
      await connection.release();
      return res.status(400).json({ message: 'El carrito está vacío.' });
    }

    // Verificar stock
    for (const item of cartItems) {
      const [[stockRow]] = await connection.query(
        'SELECT stock FROM warehouse_stock WHERE warehouse_id = ? AND product_id = ?',
        [warehouseId, item.product_id]
      );

      if (!stockRow || stockRow.stock < item.quantity) {
        await connection.rollback();
        await connection.release();
        return res.status(400).json({
          message: `Stock insuficiente para el producto ID ${item.product_id}`
        });
      }
    }

    // Restar stock
    for (const item of cartItems) {
      await connection.query(
        'UPDATE warehouse_stock SET stock = stock - ? WHERE warehouse_id = ? AND product_id = ?',
        [item.quantity, warehouseId, item.product_id]
      );
    }

    // Vaciar el carrito
    await connection.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);

    await connection.commit();
    await connection.release();

    res.status(200).json({ message: 'Compra confirmada y stock actualizado.' });
  } catch (error) {
    await connection.rollback();
    await connection.release();
    console.error('Error confirmando compra:', error);
    res.status(500).json({ error: 'Error al confirmar la compra' });
  }
};

