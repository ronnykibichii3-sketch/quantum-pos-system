const cartItemService = require('../services/cartItemService');

exports.addItem = async (req, res) => {
  try {
    const item = await cartItemService.addItem(req.body);
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getItems = async (req, res) => {
  try {
    const items = await cartItemService.getItems();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getItemById = async (req, res) => {
  try {
    const item = await cartItemService.getItemById(req.params.id);
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const item = await cartItemService.updateItem(req.params.id, req.body);
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    await cartItemService.deleteItem(req.params.id);
    res.json({ message: 'Cart item deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
