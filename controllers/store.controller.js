const storeService = require('../services/storeService');

exports.createStore = async (req, res) => {
  try {
    const store = await storeService.createStore(req.body);
    res.json(store);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; // ← THIS LINE WAS MISSING

exports.getStores = async (req, res) => {
  try {
    const stores = await storeService.getStores();
    res.json(stores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
