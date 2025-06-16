import pool from '../../models/db.js';

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_id, price_product, product_name, sku_product, is_active } = req.body;

    const [result] = await pool.query(
      'UPDATE product SET category_id=?, price_product=?, product_name=?, sku_product=?, is_active=? WHERE product_id=?',
      [category_id, price_product, product_name, sku_product, is_active, id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ message: 'Producto no encontrado' });

    res.json({ message: 'Producto actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
};
