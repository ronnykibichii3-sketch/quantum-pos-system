const prisma = require('../prismaClient');

exports.addItem = async (data) => {
  // Auto-calc total price
  data.totalPrice = data.qty * data.unitPrice;

  return prisma.cartItem.create({ data });
};

exports.getItems = async () => {
  return prisma.cartItem.findMany({
    include: {
      product: true,
      cart: true
    }
  });
};

exports.getItemById = async (id) => {
  return prisma.cartItem.findUnique({
    where: { id: Number(id) },
    include: {
      product: true,
      cart: true
    }
  });
};

exports.updateItem = async (id, data) => {
  if (data.qty && data.unitPrice) {
    data.totalPrice = data.qty * data.unitPrice;
  }

  return prisma.cartItem.update({
    where: { id: Number(id) },
    data
  });
};

exports.deleteItem = async (id) => {
  return prisma.cartItem.delete({
    where: { id: Number(id) }
  });
};
