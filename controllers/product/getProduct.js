import pool from '../../models/db.js';

export const getAllProducts = async (req, res) => {
  try {
    const [rows] = await pool.query(`
    SELECT
          p.product_id,
          p.category_id,
          p.price_product,
          p.product_name,
          p.sku_product,
          p.is_active,
          pi.image_url,
          c.category_name,
          COALESCE(SUM(ws.stock), 0) AS stock  -- suma stock de todos los warehouses
      FROM product p
      LEFT JOIN product_image pi 
          ON p.product_id = pi.product_id AND pi.is_main = TRUE
      LEFT JOIN category c
          ON p.category_id = c.category_id
      LEFT JOIN warehouse_stock ws
          ON p.product_id = ws.product_id
      GROUP BY
          p.product_id,
          p.category_id,
          p.price_product,
          p.product_name,
          p.sku_product,
          p.is_active,
          pi.image_url,
          c.category_name;
    `);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error retrieving products' });
  }
};

export const getProductById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM product WHERE product_id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener producto por ID:', error);
    res.status(500).json({ error: 'Error retrieving product' });
  }
};
