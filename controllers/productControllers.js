import pool from '../models/db.js';

export const getAllProducts = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM products');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving products' });
    }
};


export const getProductById = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving product' });
    }
};


export const insertProduct = async (req, res) => {
    try {
        const { category_id, price_product, product_name, sku_product, stock, is_active = true } = req.body;

        // Validación de campos requeridos
        if (
            category_id === undefined || 
            price_product === undefined || 
            !product_name || 
            !sku_product || 
            stock === undefined
        ) {
            return res.status(400).json({ message: 'Faltan campos requeridos' });
        }

        // Validar que is_active sea booleano
        if (typeof is_active !== 'boolean') {
            return res.status(400).json({ message: 'El campo is_active debe ser booleano (true o false)' });
        }

        // Verifica si la categoría existe
        const [categoryRows] = await pool.query('SELECT * FROM category WHERE category_id = ?', [category_id]);
        if (categoryRows.length === 0) {
            return res.status(404).json({ message: 'La categoría no existe' });
        }

        // Verifica si el SKU ya existe
        const [skuRows] = await pool.query('SELECT * FROM product WHERE sku_product = ?', [sku_product]);
        if (skuRows.length > 0) {
            return res.status(409).json({ message: 'El SKU ya está registrado' });
        }

        // Inserta el nuevo producto
        const [result] = await pool.query(
            `INSERT INTO product (category_id, price_product, product_name, sku_product, stock, is_active) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [category_id, price_product, product_name, sku_product, stock, is_active]
        );

        res.status(201).json({
            message: 'Producto insertado correctamente',
            product_id: result.insertId,
        });

    } catch (error) {
        console.error('Error al insertar producto:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

