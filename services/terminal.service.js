const prisma = require('../db.js');

const TerminalService = {
  create(data) {
    return prisma.terminal.create({ data });
  },

  getByStore(storeId) {
    return prisma.terminal.findMany({ where: { storeId } });
  }
};

module.exports = { TerminalService };
