const prisma = require('../prismaClient');

exports.createPayment = async (data) => {
  return prisma.payment.create({ data });
};

exports.getPayments = async () => {
  return prisma.payment.findMany({
    include: {
      cart: true
    }
  });
};

exports.getPaymentById = async (id) => {
  return prisma.payment.findUnique({
    where: { id: Number(id) },
    include: {
      cart: true
    }
  });
};

exports.updatePayment = async (id, data) => {
  return prisma.payment.update({
    where: { id: Number(id) },
    data
  });
};

exports.deletePayment = async (id) => {
  return prisma.payment.delete({
    where: { id: Number(id) }
  });
};
