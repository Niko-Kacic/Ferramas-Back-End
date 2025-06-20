import pool from '../../models/db.js';

export const getAllCategories = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM category');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving categories' });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { category_name } = req.body;
    const [result] = await pool.query('INSERT INTO category (category_name) VALUES (?)', [category_name]);
    res.status(201).json({ category_id: result.insertId, message: 'Category created' });
  } catch (error) {
    res.status(500).json({ error: 'Error creating category' });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_name } = req.body;
    const [result] = await pool.query('UPDATE category SET category_name = ? WHERE category_id = ?', [category_name, id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category updated' });
  } catch (error) {
    res.status(500).json({ error: 'Error updating category' });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM category WHERE category_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting category' });
  }
};
