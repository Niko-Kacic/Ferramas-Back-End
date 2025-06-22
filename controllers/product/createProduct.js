import pool from '../../models/db.js';

export const insertProduct = async (req, res) => {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
        let products = [];

        if (Array.isArray(req.body)) {
            products = req.body;
        } else if (typeof req.body === 'object' && req.body !== null) {
            products = [req.body];
        } else {
            return res.status(400).json({ message: 'Formato inválido para producto(s)' });
        }

        const insertedProducts = [];

        for (const product of products) {
            const {
                category_id,
                price_product,
                product_name,
                sku_product,
                stock,
                warehouse_id,
                is_active = true
            } = product;

            if (!category_id || !price_product || !product_name || !sku_product || !stock || !warehouse_id) {
                await connection.rollback();
                return res.status(400).json({ message: 'Faltan campos requeridos en algún producto' });
            }

            // Validar existencia de categoría
            const [categoryRows] = await connection.query(
                'SELECT * FROM category WHERE category_id = ?',
                [category_id]
            );
            if (categoryRows.length === 0) {
                await connection.rollback();
                return res.status(404).json({ message: `La categoría ${category_id} no existe` });
            }

            // Validar que SKU sea único
            const [skuRows] = await connection.query(
                'SELECT * FROM product WHERE sku_product = ?',
                [sku_product]
            );
            if (skuRows.length > 0) {
                await connection.rollback();
                return res.status(409).json({ message: `El SKU ${sku_product} ya está registrado` });
            }

            // Insertar producto
            const [productResult] = await connection.query(
                `INSERT INTO product (category_id, price_product, product_name, sku_product, is_active)
                 VALUES (?, ?, ?, ?, ?)`,
                [category_id, price_product, product_name, sku_product, is_active]
            );

            const product_id = productResult.insertId;

            // Insertar stock inicial
            await connection.query(
                'INSERT INTO warehouse_stock (warehouse_id, product_id, stock) VALUES (?, ?, ?)',
                [warehouse_id, product_id, stock]
            );

            insertedProducts.push({
                product_id,
                product_name,
                sku_product
            });
        }

        await connection.commit();
        res.status(201).json({
            message: 'Producto(s) insertado(s) correctamente',
            inserted: insertedProducts
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error al insertar producto(s):', error);
        res.status(500).json({ message: 'Error del servidor' });
    } finally {
        connection.release();
    }
};
