const prisma = require('../db.js');

const CartService = {
  create(data) {
    return prisma.cart.create({ data });
  },

  addItem(cartId, item) {
    return prisma.cartItem.create({
      data: {
        cartId,
        productId: item.productId,
        qty: item.qty,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice
      }
    });
  },

  getCart(cartId) {
    return prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: true,
        payments: true
      }
    });
  }
};

module.exports = { CartService };
