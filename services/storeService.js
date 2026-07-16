const prisma = require('../prismaClient');

exports.createStore = async (data) => {
  return prisma.store.create({
    data
  });
};

exports.getStores = async () => {
  return prisma.store.findMany();
};
