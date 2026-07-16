const fs = require('fs');

const dirs = [
  'controllers',
  'services',
  'routes',
  'prisma'
];

const files = [
  'prisma/schema.prisma',
  'controllers/store.controller.js',
  'controllers/terminal.controller.js',
  'controllers/product.controller.js',
  'controllers/cart.controller.js',
  'controllers/payment.controller.js',
  'services/store.service.js',
  'services/terminal.service.js',
  'services/product.service.js',
  'services/cart.service.js',
  'services/payment.service.js',
  'routes/store.routes.js',
  'routes/terminal.routes.js',
  'routes/product.routes.js',
  'routes/cart.routes.js',
  'routes/payment.routes.js',
  'db.js',
  'index.js',
  '.env'
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
});

files.forEach(file => {
  if (!fs.existsSync(file)) fs.writeFileSync(file, '');
});

console.log('Backend structure created successfully.');
