import pool from '../../models/db.js';

// Crear delivery cuando se confirma el carrito
export const createDelivery = async (req, res) => {
  try {
    const { cart_id, is_delivery } = req.body;

    if (!is_delivery) {
      return res.status(400).json({ message: 'Delivery no solicitado' });
    }

    const [result] = await pool.query(
      'INSERT INTO delivery (cart_id, is_delivery) VALUES (?, ?)',
      [cart_id, is_delivery]
    );

    res.status(201).json({ delivery_id: result.insertId, message: 'Delivery creado' });
  } catch (error) {
    console.error('Error creando delivery:', error);
    res.status(500).json({ error: 'Error creando delivery' });
  }
};

// Obtener info de delivery por carrito
export const getDeliveryByCart = async (req, res) => {
  try {
    const { cartId } = req.params;
    const [rows] = await pool.query('SELECT * FROM delivery WHERE cart_id = ?', [cartId]);

    if (rows.length === 0) return res.status(404).json({ message: 'No hay delivery para este carrito' });

    res.json(rows[0]);
  } catch (error) {
    console.error('Error obteniendo delivery:', error);
    res.status(500).json({ error: 'Error obteniendo delivery' });
  }
};

// Actualizar estado de delivery (ej. pasa a on_delivery o delivered)
export const updateDeliveryStatus = async (req, res) => {
  try {
    const { cartId } = req.params;
    const { delivery_status } = req.body;

    const validStatuses = ['processing', 'bought', 'on_delivery', 'delivered'];
    if (!validStatuses.includes(delivery_status)) {
      return res.status(400).json({ message: 'Estado inválido' });
    }

    const [result] = await pool.query(
      'UPDATE delivery SET delivery_status = ? WHERE cart_id = ?',
      [delivery_status, cartId]
    );

    if (result.affectedRows === 0) return res.status(404).json({ message: 'Delivery no encontrado' });

    res.json({ message: 'Estado actualizado correctamente' });
  } catch (error) {
    console.error('Error actualizando delivery:', error);
    res.status(500).json({ error: 'Error actualizando estado de delivery' });
  }
};