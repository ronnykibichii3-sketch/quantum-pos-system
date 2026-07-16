const prisma = require('../prismaClient');

exports.createCart = async (data) => {
  return prisma.cart.create({ data });
};

exports.getCarts = async () => {
  return prisma.cart.findMany({
    include: {
      items: true,
      payments: true
    }
  });
};

exports.getCartById = async (id) => {
  return prisma.cart.findUnique({
    where: { id: Number(id) },
    include: {
      items: true,
      payments: true
    }
  });
};

exports.updateCart = async (id, data) => {
  return prisma.cart.update({
    where: { id: Number(id) },
    data
  });
};

exports.deleteCart = async (id) => {
  return prisma.cart.delete({
    where: { id: Number(id) }
  });
};
