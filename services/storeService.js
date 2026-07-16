const prisma = require('../prismaClient');

exports.createStore = async (data) => {
  return prisma.store.create({
    data
  });
};

exports.getStores = async () => {
  return prisma.store.findMany();
};

exports.getStoreById = async (id) => {
  return prisma.store.findUnique({
    where: { id: Number(id) }
  });
};

exports.updateStoreLanguage = async (id, defaultLanguage) => {
  return prisma.store.update({
    where: { id: Number(id) },
    data: { defaultLanguage }
  });
};
