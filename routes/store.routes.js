const express = require('express');
const router = express.Router();
const storeController = require('../controllers/store.controller');
const { authenticateEmployee, requireRoles } = require('../utils/employeeAuth');

router.post('/', storeController.createStore);
router.get('/', storeController.getStores);
router.get('/:id', storeController.getStoreById);
router.patch('/:id/language', authenticateEmployee, requireRoles('admin', 'manager'), storeController.updateStoreLanguage);

module.exports = router;
