require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 3002;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`✅ Product Service is running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
    console.log(`📦 Products endpoint: http://localhost:${PORT}/products`);
  });
};

startServer();
