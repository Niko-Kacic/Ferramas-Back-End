import pool from '../../models/db.js';

export const getAllProducts = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM product');
        res.json(rows);
    } catch (error) {
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
