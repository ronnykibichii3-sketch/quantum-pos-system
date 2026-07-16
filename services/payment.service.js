const prisma = require('../db.js');

const PaymentService = {
  create(data) {
    return prisma.payment.create({ data });
  }
};

module.exports = { PaymentService };
