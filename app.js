import express from 'express';
import dotenv from 'dotenv';
import productRoutes from './routes/productRoutes.js';
import paymentRoutes from './routes/payment.routes.js';
import cartRoutes from './routes/cartRoutes.js';
import categoryRoutes from './routes/cartRoutes.js';
import warehouseRoutes from './routes/wareHouseRoutes.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

//Product Routes
app.use('/api/products', productRoutes);

//Payment Routes
app.use('/api', paymentRoutes);

//WarehouseRoutes
app.use('/api/warehouses', warehouseRoutes);

//categoryRoutes
app.use('/api/categories', categoryRoutes);

//Cart Routes
app.use('/api/cart', cartRoutes);




app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
