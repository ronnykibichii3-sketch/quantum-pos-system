const cartService = require('../services/cartService');

exports.createCart = async (req, res) => {
  try {
    const cart = await cartService.createCart(req.body);
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCarts = async (req, res) => {
  try {
    const carts = await cartService.getCarts();
    res.json(carts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCartById = async (req, res) => {
  try {
    const cart = await cartService.getCartById(req.params.id);
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateCart = async (req, res) => {
  try {
    const cart = await cartService.updateCart(req.params.id, req.body);
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteCart = async (req, res) => {
  try {
    await cartService.deleteCart(req.params.id);
    res.json({ message: 'Cart deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
