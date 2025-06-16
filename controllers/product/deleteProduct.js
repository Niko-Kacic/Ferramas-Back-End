import pool from '../../models/db.js';

export const deleteProduct = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM product WHERE product_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Producto no encontrado' });

    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
};