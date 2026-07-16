
const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'), { index: false }));

// ROUTES IMPORTS
const storeRoutes = require('./routes/store.routes');
const productRoutes = require('./routes/product.routes');
const terminalRoutes = require('./routes/terminal.routes');
const cartRoutes = require('./routes/cart.routes');
const cartItemRoutes = require('./routes/cartItem.routes');
const paymentRoutes = require('./routes/payment.routes');
const employeeRoutes = require('./routes/employee.routes');
const receiptRoutes = require('./routes/receipt.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const forecastRoutes = require('./routes/forecast.routes');

// ROUTES MOUNT
app.use('/stores', storeRoutes);
app.use('/products', productRoutes);
app.use('/terminals', terminalRoutes);
app.use('/carts', cartRoutes);
app.use('/cart-items', cartItemRoutes);
app.use('/payments', paymentRoutes);
app.use('/employees', employeeRoutes);
app.use('/receipts', receiptRoutes);
app.use('/inventory', inventoryRoutes);
app.use('/forecasts', forecastRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pos.html'));
});

// SERVER START
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
