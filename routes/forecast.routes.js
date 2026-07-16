const express = require('express');
const router = express.Router();
const forecastController = require('../controllers/forecast.controller');
const { authenticateEmployee, requireRoles } = require('../utils/employeeAuth');

router.post('/generate', authenticateEmployee, requireRoles('admin', 'manager'), forecastController.generateForecast);
router.get('/', authenticateEmployee, requireRoles('admin', 'manager'), forecastController.getForecasts);
router.get('/:id', authenticateEmployee, requireRoles('admin', 'manager'), forecastController.getForecastById);

module.exports = router;