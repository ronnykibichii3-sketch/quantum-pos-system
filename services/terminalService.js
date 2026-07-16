const prisma = require('../prismaClient');

exports.createTerminal = async (data) => {
  return prisma.terminal.create({ data });
};

exports.getTerminals = async () => {
  return prisma.terminal.findMany();
};

exports.getTerminalById = async (id) => {
  return prisma.terminal.findUnique({
    where: { id: Number(id) }
  });
};

exports.updateTerminal = async (id, data) => {
  return prisma.terminal.update({
    where: { id: Number(id) },
    data
  });
};

exports.deleteTerminal = async (id) => {
  return prisma.terminal.delete({
    where: { id: Number(id) }
  });
};
