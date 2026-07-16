const express = require('express');
const router = express.Router();
const storeController = require('../controllers/store.controller');

router.post('/', storeController.createStore);
router.get('/', storeController.getStores);

module.exports = router;
