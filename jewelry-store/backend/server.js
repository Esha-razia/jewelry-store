const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db.js');
const { notFound, errorHandler } = require('./middleware/errorMiddleware.js');
const userRoutes = require('./routes/userRoutes.js');
const productRoutes = require('./routes/productRoutes.js');
const orderRoutes = require('./routes/orderRoutes.js');
const { trackOrderPublic, addOrderItems } = require('./controllers/orderController.js');
const { protect } = require('./middleware/authMiddleware.js');
const chatRoutes = require('./routes/chatRoutes.js');
const analyticsRoutes = require('./routes/analyticsRoutes.js');
const newsletterRoutes = require('./routes/newsletterRoutes.js');
const contactRoutes = require('./routes/contactRoutes.js');


// Load env variables
dotenv.config();

// Connect to DB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
// Express 5: register critical order routes on app (router mount can miss POST paths)
app.post('/api/orders/track', trackOrderPublic);
app.post('/api/orders', protect, addOrderItems);
app.use('/api/orders', orderRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/contact', contactRoutes);


// Basic route
app.get('/', (req, res) => {
  res.send('Jewelry Store API is running...');
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
