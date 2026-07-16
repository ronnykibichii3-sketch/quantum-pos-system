const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee.controller');
const { authenticateEmployee, requireRoles } = require('../utils/employeeAuth');

router.post('/login', employeeController.loginEmployee);
router.get('/me', authenticateEmployee, employeeController.getMe);
router.post('/', employeeController.createEmployee);
router.get('/', authenticateEmployee, requireRoles('admin', 'manager'), employeeController.getEmployees);
router.get('/:id', authenticateEmployee, requireRoles('admin', 'manager'), employeeController.getEmployeeById);
router.put('/:id', authenticateEmployee, requireRoles('admin', 'manager'), employeeController.updateEmployee);
router.delete('/:id', authenticateEmployee, requireRoles('admin', 'manager'), employeeController.deleteEmployee);

module.exports = router;