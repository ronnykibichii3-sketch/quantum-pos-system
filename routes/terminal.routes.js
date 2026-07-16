const express = require('express');
const router = express.Router();
const terminalController = require('../controllers/terminal.controller');

router.post('/', terminalController.createTerminal);
router.get('/', terminalController.getTerminals);
router.get('/:id', terminalController.getTerminalById);
router.put('/:id', terminalController.updateTerminal);
router.delete('/:id', terminalController.deleteTerminal);

module.exports = router;
