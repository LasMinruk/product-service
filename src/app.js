const express = require('express');
const app = express();

// Middleware
app.use(express.json());

// Import routes
const productRoutes = require('./routes/productRoutes');

// Mount routes
app.use('/products', productRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'product-service',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Handle unknown routes - using regex pattern for catch-all
app.use(/.*/, (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

module.exports = app;