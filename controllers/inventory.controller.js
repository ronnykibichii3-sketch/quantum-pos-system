const inventoryService = require('../services/inventoryService');

exports.recordMovement = async (req, res) => {
  try {
    const movement = await inventoryService.recordMovement({
      ...req.body,
      employeeId: req.employee && req.employee.employeeId
    });
    res.json(movement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMovements = async (req, res) => {
  try {
    const movements = await inventoryService.getMovements();
    res.json(movements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMovementById = async (req, res) => {
  try {
    const movement = await inventoryService.getMovementById(req.params.id);
    res.json(movement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.adjustStock = async (req, res) => {
  try {
    const movement = await inventoryService.adjustStock(req.params.id, {
      ...req.body,
      employeeId: req.employee && req.employee.employeeId
    });
    res.json(movement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getLowStockProducts = async (req, res) => {
  try {
    const products = await inventoryService.getLowStockProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getInventorySnapshot = async (req, res) => {
  try {
    const products = await inventoryService.getInventorySnapshot();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};