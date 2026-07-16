const express = require('express');
const router = express.Router();
const receiptController = require('../controllers/receipt.controller');
const { authenticateEmployee, requireRoles } = require('../utils/employeeAuth');

router.post('/generate/:cartId', authenticateEmployee, receiptController.generateReceiptFromCart);
router.get('/', authenticateEmployee, requireRoles('admin', 'manager', 'cashier'), receiptController.getReceipts);
router.get('/:id', authenticateEmployee, requireRoles('admin', 'manager', 'cashier'), receiptController.getReceiptById);
router.delete('/:id', authenticateEmployee, requireRoles('admin', 'manager'), receiptController.deleteReceipt);

module.exports = router;