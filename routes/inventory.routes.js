const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');
const { authenticateEmployee, requireRoles } = require('../utils/employeeAuth');

router.get('/snapshot', authenticateEmployee, requireRoles('admin', 'manager', 'cashier'), inventoryController.getInventorySnapshot);
router.get('/low-stock', authenticateEmployee, requireRoles('admin', 'manager'), inventoryController.getLowStockProducts);
router.get('/movements', authenticateEmployee, requireRoles('admin', 'manager'), inventoryController.getMovements);
router.get('/movements/:id', authenticateEmployee, requireRoles('admin', 'manager'), inventoryController.getMovementById);
router.post('/movements', authenticateEmployee, requireRoles('admin', 'manager'), inventoryController.recordMovement);
router.patch('/products/:id/adjust', authenticateEmployee, requireRoles('admin', 'manager'), inventoryController.adjustStock);

module.exports = router;