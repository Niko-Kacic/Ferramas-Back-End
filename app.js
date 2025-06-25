import express from 'express';
import dotenv from 'dotenv';
import productRoutes from './routes/productRoutes.js';
import paymentRoutes from './routes/payment.routes.js';
import cartRoutes from './routes/cartRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import warehouseRoutes from './routes/wareHouseRoutes.js';
import deliveryRoutes from './routes/deliveryRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(express.json());

//Product Routes
app.use('/api/products', productRoutes);

//Payment Routes
app.use('/api/payments', paymentRoutes);

//WarehouseRoutes
app.use('/api/warehouses', warehouseRoutes);

//categoryRoutes
app.use('/api/categories', categoryRoutes);

//Cart Routes
app.use('/api/cart', cartRoutes);

//devliveryRoutes
app.use('/api/delivery', deliveryRoutes); 


app.use(express.static(path.join(__dirname, 'html')));


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
