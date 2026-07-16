const express = require('express');
const router = express.Router();
const cartItemController = require('../controllers/cartItem.controller');

router.post('/', cartItemController.addItem);
router.get('/', cartItemController.getItems);
router.get('/:id', cartItemController.getItemById);
router.put('/:id', cartItemController.updateItem);
router.delete('/:id', cartItemController.deleteItem);

module.exports = router;
