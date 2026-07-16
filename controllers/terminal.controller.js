const terminalService = require('../services/terminalService');

exports.createTerminal = async (req, res) => {
  try {
    const terminal = await terminalService.createTerminal(req.body);
    res.json(terminal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTerminals = async (req, res) => {
  try {
    const terminals = await terminalService.getTerminals();
    res.json(terminals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTerminalById = async (req, res) => {
  try {
    const terminal = await terminalService.getTerminalById(req.params.id);
    res.json(terminal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateTerminal = async (req, res) => {
  try {
    const terminal = await terminalService.updateTerminal(req.params.id, req.body);
    res.json(terminal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTerminal = async (req, res) => {
  try {
    await terminalService.deleteTerminal(req.params.id);
    res.json({ message: 'Terminal deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
