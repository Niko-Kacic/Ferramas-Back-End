import pool from '../../models/db.js';

export const getAllWarehouses = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM warehouse');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving warehouses' });
  }
};

export const createWarehouse = async (req, res) => {
  try {
    const { warehouse_name, location, is_active } = req.body;
    const [result] = await pool.query(
      'INSERT INTO warehouse (warehouse_name, location, is_active) VALUES (?, ?, ?)',
      [warehouse_name, location, is_active ?? true]
    );
    res.status(201).json({ warehouse_id: result.insertId, message: 'Warehouse created' });
  } catch (error) {
    res.status(500).json({ error: 'Error creating warehouse' });
  }
};

export const updateWarehouse = async (req, res) => {
  try {
    const { id } = req.params;
    const { warehouse_name, location, is_active } = req.body;
    const [result] = await pool.query(
      'UPDATE warehouse SET warehouse_name = ?, location = ?, is_active = ? WHERE warehouse_id = ?',
      [warehouse_name, location, is_active, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Warehouse not found' });
    res.json({ message: 'Warehouse updated' });
  } catch (error) {
    res.status(500).json({ error: 'Error updating warehouse' });
  }
};

export const deleteWarehouse = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM warehouse WHERE warehouse_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Warehouse not found' });
    res.json({ message: 'Warehouse deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting warehouse' });
  }
};

//Stock para los warehouses
// 1. Insertar nuevo stock
export const addStock = async (req, res) => {
  const { warehouse_id, product_id, stock } = req.body;
  try {
    await pool.query(
      'INSERT INTO warehouse_stock (warehouse_id, product_id, stock) VALUES (?, ?, ?)',
      [warehouse_id, product_id, stock]
    );
    res.status(201).json({ message: 'Stock agregado correctamente' });
  } catch (error) {
    console.error('Error agregando stock:', error);
    res.status(500).json({ error: 'Error agregando stock' });
  }
};

// 2. Actualizar stock existente
export const updateStock = async (req, res) => {
  const { warehouse_id, product_id } = req.params;
  const { stock } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE warehouse_stock SET stock = ? WHERE warehouse_id = ? AND product_id = ?',
      [stock, warehouse_id, product_id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Registro no encontrado' });
    }
    res.json({ message: 'Stock actualizado correctamente' });
  } catch (error) {
    console.error('Error actualizando stock:', error);
    res.status(500).json({ error: 'Error actualizando stock' });
  }
};

// 3. Obtener stock por bodega
export const getStockByWarehouse = async (req, res) => {
  const { warehouse_id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT ws.product_id, p.product_name, ws.stock 
       FROM warehouse_stock ws
       JOIN product p ON ws.product_id = p.product_id
       WHERE ws.warehouse_id = ?`,
      [warehouse_id]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo stock:', error);
    res.status(500).json({ error: 'Error obteniendo stock' });
  }
};