const { v4: uuidv4 } = require('uuid');
const products = require('../data/products');

// GET /products - Returns all products
const getAllProducts = (req, res) => {
  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
};

// GET /products/:id - Returns a single product by ID
const getProductById = (req, res) => {
  const product = products.find(p => p.id === req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: `Product with ID ${req.params.id} not found`
    });
  }

  res.status(200).json({
    success: true,
    data: product
  });
};

// POST /products - Creates a new product
const createProduct = (req, res) => {
  const { name, description, price, stock, category } = req.body;

  // Validation
  if (!name || !price) {
    return res.status(400).json({
      success: false,
      message: 'Please provide at least name and price'
    });
  }

  if (isNaN(price) || price <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Price must be a positive number'
    });
  }

  const newProduct = {
    id: `prod-${uuidv4().split('-')[0]}`,
    name,
    description: description || '',
    price: parseFloat(price),
    stock: stock || 0,
    category: category || 'General',
    createdAt: new Date().toISOString()
  };

  products.push(newProduct);

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: newProduct
  });
};

// PATCH /products/:id/stock - Reduce stock when order is placed
// This is called by Order Service after a successful order
const updateStock = (req, res) => {
  const product = products.find(p => p.id === req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: `Product with ID ${req.params.id} not found`
    });
  }

  const { quantity } = req.body;

  if (!quantity || isNaN(quantity) || quantity <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid quantity'
    });
  }

  if (product.stock < quantity) {
    return res.status(400).json({
      success: false,
      message: `Insufficient stock. Available: ${product.stock}`
    });
  }

  product.stock -= quantity;

  res.status(200).json({
    success: true,
    message: 'Stock updated successfully',
    data: product
  });
};

module.exports = { getAllProducts, getProductById, createProduct, updateStock };