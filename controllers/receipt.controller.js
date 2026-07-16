const receiptService = require('../services/receiptService');

exports.generateReceiptFromCart = async (req, res) => {
  try {
    const receipt = await receiptService.generateReceiptFromCart(req.params.cartId, {
      ...req.body,
      employeeId: req.employee && req.employee.employeeId
    });
    res.json(receipt);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getReceipts = async (req, res) => {
  try {
    const receipts = await receiptService.getReceipts();
    res.json(receipts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getReceiptById = async (req, res) => {
  try {
    const receipt = await receiptService.getReceiptById(req.params.id);
    res.json(receipt);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteReceipt = async (req, res) => {
  try {
    await receiptService.deleteReceipt(req.params.id);
    res.json({ message: 'Receipt deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};