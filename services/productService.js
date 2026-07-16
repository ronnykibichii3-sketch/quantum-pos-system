const prisma = require('../prismaClient');

exports.createProduct = async (data) => {
  return prisma.product.create({ data });
};

exports.getProducts = async () => {
  return prisma.product.findMany();
};

exports.getProductById = async (id) => {
  return prisma.product.findUnique({
    where: { id: Number(id) }
  });
};

exports.updateProduct = async (id, data) => {
  return prisma.product.update({
    where: { id: Number(id) },
    data
  });
};

exports.deleteProduct = async (id) => {
  return prisma.product.delete({
    where: { id: Number(id) }
  });
};
