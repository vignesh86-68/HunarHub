const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CLIENT_URL
    : true,
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Routes
const authRoutes = require('./routes/authRoutes');
const entrepreneurRoutes = require('./routes/entrepreneurRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const serviceRequestRoutes = require('./routes/serviceRequestRoutes');
const adminRoutes = require('./routes/adminRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/entrepreneurs', entrepreneurRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/service-requests', serviceRequestRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'HunarHub API is running...' });
});

// Multer errors (bad file type, file too large) land here instead of
// bubbling up as an unhandled 500.
const multer = require('multer');
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message?.includes('images are allowed')) {
    return res.status(400).json({ message: err.message });
  }
  next(err);
});


const PORT = process.env.PORT || 10000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
