const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateStock
} = require('../controllers/productController');

// Define routes
router.get('/', getAllProducts);              // GET /products
router.get('/:id', getProductById);          // GET /products/prod-001
router.post('/', createProduct);             // POST /products
router.patch('/:id/stock', updateStock);     // PATCH /products/prod-001/stock

module.exports = router;