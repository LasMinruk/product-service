const Product = require('../models/Product');

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: `Product with ID ${req.params.id} not found` });
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    if (error.name === 'CastError') return res.status(404).json({ success: false, message: `Product with ID ${req.params.id} not found` });
    res.status(500).json({ success: false, message: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;
    if (!name || !price) return res.status(400).json({ success: false, message: 'Please provide at least name and price' });
    if (isNaN(price) || price <= 0) return res.status(400).json({ success: false, message: 'Price must be a positive number' });

    const product = await Product.create({ name, description, price: parseFloat(price), stock: stock || 0, category: category || 'General' });
    res.status(201).json({ success: true, message: 'Product created successfully', data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Called by Order Service to reduce stock
const updateStock = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: `Product with ID ${req.params.id} not found` });

    const { quantity } = req.body;
    if (!quantity || isNaN(quantity) || quantity <= 0) return res.status(400).json({ success: false, message: 'Please provide a valid quantity' });
    if (product.stock < quantity) return res.status(400).json({ success: false, message: `Insufficient stock. Available: ${product.stock}` });

    product.stock -= parseInt(quantity);
    await product.save();

    res.status(200).json({ success: true, message: 'Stock updated successfully', data: product });
  } catch (error) {
    if (error.name === 'CastError') return res.status(404).json({ success: false, message: `Product with ID ${req.params.id} not found` });
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllProducts, getProductById, createProduct, updateStock };