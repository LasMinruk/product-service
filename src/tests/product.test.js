const request = require('supertest');
const app = require('../app');
const Product = require('../models/Product');

// Mock the Product model — no real DB needed
jest.mock('../models/Product');

// ─────────────────────────────────────────────────────────
// Sample test data
// ─────────────────────────────────────────────────────────
const sampleProduct = {
  _id: '64f1a2b3c4d5e6f7a8b9c0d1',
  name: 'Wireless Headphones',
  description: 'Noise cancelling bluetooth headphones',
  price: 4500,
  stock: 50,
  category: 'Electronics',
  createdAt: '2026-01-01T00:00:00.000Z'
};

const validPayload = {
  name: 'Wireless Headphones',
  description: 'Noise cancelling bluetooth headphones',
  price: 4500,
  stock: 50,
  category: 'Electronics'
};

// ─────────────────────────────────────────────────────────
// GET /health
// ─────────────────────────────────────────────────────────
describe('GET /health', () => {
  it('should return healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.service).toBe('product-service');
    expect(res.body.status).toBe('healthy');
    expect(res.body.timestamp).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────
// GET /products
// ─────────────────────────────────────────────────────────
describe('GET /products', () => {
  it('should return all products successfully', async () => {
    Product.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue([sampleProduct])
    });

    const res = await request(app).get('/products');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(1);
    expect(res.body.data).toHaveLength(1);
  });

  it('should return empty array when no products exist', async () => {
    Product.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue([])
    });

    const res = await request(app).get('/products');
    expect(res.statusCode).toBe(200);
    expect(res.body.count).toBe(0);
    expect(res.body.data).toHaveLength(0);
  });

  it('should return 500 when database throws error', async () => {
    Product.find.mockReturnValue({
      sort: jest.fn().mockRejectedValue(new Error('DB error'))
    });

    const res = await request(app).get('/products');
    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────
// GET /products/:id
// ─────────────────────────────────────────────────────────
describe('GET /products/:id', () => {
  it('should return a single product by ID', async () => {
    Product.findById.mockResolvedValue(sampleProduct);

    const res = await request(app).get('/products/64f1a2b3c4d5e6f7a8b9c0d1');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe('64f1a2b3c4d5e6f7a8b9c0d1');
  });

  it('should return 404 when product is not found', async () => {
    Product.findById.mockResolvedValue(null);

    const res = await request(app).get('/products/64f1a2b3c4d5e6f7a8b9c0d9');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 404 for invalid ObjectId format', async () => {
    const castError = new Error('Cast error');
    castError.name = 'CastError';
    Product.findById.mockRejectedValue(castError);

    const res = await request(app).get('/products/invalid-id');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 500 when database throws error', async () => {
    Product.findById.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/products/64f1a2b3c4d5e6f7a8b9c0d1');
    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────
// POST /products
// ─────────────────────────────────────────────────────────
describe('POST /products', () => {
  it('should create a product successfully', async () => {
    Product.create.mockResolvedValue(sampleProduct);

    const res = await request(app).post('/products').send(validPayload);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Product created successfully');
    expect(res.body.data.name).toBe('Wireless Headphones');
  });

  it('should return 400 when name is missing', async () => {
    const { name, ...noName } = validPayload;
    const res = await request(app).post('/products').send(noName);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Please provide at least name and price');
  });

  it('should return 400 when price is missing', async () => {
    const { price, ...noPrice } = validPayload;
    const res = await request(app).post('/products').send(noPrice);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Please provide at least name and price');
  });

  it('should return 400 when price is negative', async () => {
    const res = await request(app).post('/products').send({ ...validPayload, price: -100 });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Price must be a positive number');
  });

  it('should return 500 when database throws error', async () => {
    Product.create.mockRejectedValue(new Error('DB write error'));
    const res = await request(app).post('/products').send(validPayload);
    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────
// PATCH /products/:id/stock
// ─────────────────────────────────────────────────────────
describe('PATCH /products/:id/stock', () => {
  it('should reduce stock successfully', async () => {
    const mockSave = jest.fn().mockResolvedValue(true);
    Product.findById.mockResolvedValue({ ...sampleProduct, stock: 50, save: mockSave });

    const res = await request(app)
      .patch('/products/64f1a2b3c4d5e6f7a8b9c0d1/stock')
      .send({ quantity: 5 });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Stock updated successfully');
  });

  it('should return 404 when product not found', async () => {
    Product.findById.mockResolvedValue(null);

    const res = await request(app)
      .patch('/products/64f1a2b3c4d5e6f7a8b9c0d9/stock')
      .send({ quantity: 5 });

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 when quantity is invalid', async () => {
    Product.findById.mockResolvedValue({ ...sampleProduct, stock: 50 });

    const res = await request(app)
      .patch('/products/64f1a2b3c4d5e6f7a8b9c0d1/stock')
      .send({ quantity: -1 });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Please provide a valid quantity');
  });

  it('should return 400 when stock is insufficient', async () => {
    Product.findById.mockResolvedValue({ ...sampleProduct, stock: 2 });

    const res = await request(app)
      .patch('/products/64f1a2b3c4d5e6f7a8b9c0d1/stock')
      .send({ quantity: 10 });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('Insufficient stock');
  });

  it('should return 404 for invalid ObjectId', async () => {
    const castError = new Error('Cast error');
    castError.name = 'CastError';
    Product.findById.mockRejectedValue(castError);

    const res = await request(app)
      .patch('/products/invalid-id/stock')
      .send({ quantity: 5 });

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────
// Unknown routes
// ─────────────────────────────────────────────────────────
describe('Unknown routes', () => {
  it('should return 404 for unknown route', async () => {
    const res = await request(app).get('/unknown-route');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Route not found');
  });
});
