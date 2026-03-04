// In-memory product database
const products = [
  {
    id: "prod-001",
    name: "Wireless Headphones",
    description: "Noise cancelling bluetooth headphones",
    price: 4500.00,
    stock: 50,
    category: "Electronics",
    createdAt: "2026-01-01T00:00:00.000Z"
  },
  {
    id: "prod-002",
    name: "Running Shoes",
    description: "Lightweight running shoes size 42",
    price: 8500.00,
    stock: 30,
    category: "Footwear",
    createdAt: "2026-01-02T00:00:00.000Z"
  },
  {
    id: "prod-003",
    name: "Python Programming Book",
    description: "Complete guide to Python programming",
    price: 1200.00,
    stock: 100,
    category: "Books",
    createdAt: "2026-01-03T00:00:00.000Z"
  }
];

module.exports = products;