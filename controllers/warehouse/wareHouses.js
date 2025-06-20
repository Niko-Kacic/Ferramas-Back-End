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
