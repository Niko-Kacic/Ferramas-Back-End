import pool from '../../models/db.js';

export const insertProduct = async (req, res) => {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
        const {
            category_id,
            price_product,
            product_name,
            sku_product,
            stock,
            warehouse_id,
            is_active = true // por defecto true
        } = req.body;

        if (!category_id || !price_product || !product_name || !sku_product || !stock || !warehouse_id) {
            return res.status(400).json({ message: 'Faltan campos requeridos' });
        }

        // Verificar si la categoría existe
        const [categoryRows] = await connection.query(
            'SELECT * FROM category WHERE category_id = ?',
            [category_id]
        );
        if (categoryRows.length === 0) {
            return res.status(404).json({ message: 'La categoría no existe' });
        }

        // Verificar si el SKU ya existe
        const [skuRows] = await connection.query(
            'SELECT * FROM product WHERE sku_product = ?',
            [sku_product]
        );
        if (skuRows.length > 0) {
            return res.status(409).json({ message: 'El SKU ya está registrado' });
        }

        // Insertar el producto
        const [productResult] = await connection.query(
            `INSERT INTO product (category_id, price_product, product_name, sku_product, is_active)
             VALUES (?, ?, ?, ?, ?)`,
            [category_id, price_product, product_name, sku_product, is_active]
        );

        const product_id = productResult.insertId;

        // Insertar el stock inicial en warehouse_stock
        await connection.query(
            'INSERT INTO warehouse_stock (warehouse_id, product_id, stock) VALUES (?, ?, ?)',
            [warehouse_id, product_id, stock]
        );

        await connection.commit();

        res.status(201).json({
            message: 'Producto insertado correctamente',
            product_id
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error al insertar producto:', error);
        res.status(500).json({ message: 'Error del servidor' });
    } finally {
        connection.release();
    }
};