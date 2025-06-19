import express from 'express';
import dotenv from 'dotenv';
import productRoutes from './routes/productRoutes.js';
import paymentRoutes from './routes/payment.routes.js';
import cartRoutes from './routes/cartRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

//Product Routes
app.use('/api/products', productRoutes);

//Payment Routes
app.use('/api', paymentRoutes);

//Cart Routes
app.use('/api/cart', cartRoutes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
