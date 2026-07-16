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

exports.getStoreById = async (req, res) => {
  try {
    const store = await storeService.getStoreById(req.params.id);
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    return res.json(store);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.updateStoreLanguage = async (req, res) => {
  try {
    const { defaultLanguage } = req.body || {};
    if (defaultLanguage === null) {
      const store = await storeService.updateStoreLanguage(req.params.id, null);
      return res.json(store);
    }

    if (!defaultLanguage || typeof defaultLanguage !== 'string') {
      return res.status(400).json({ error: 'defaultLanguage is required (string or null)' });
    }

    const normalized = defaultLanguage.trim().toLowerCase();
    const allowed = ['en', 'sw', 'fr', 'es', 'ar', 'de', 'it', 'pt'];
    if (!allowed.includes(normalized)) {
      return res.status(400).json({ error: 'Unsupported language code' });
    }

    const store = await storeService.updateStoreLanguage(req.params.id, normalized);
    return res.json(store);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
