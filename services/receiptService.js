const prisma = require('../prismaClient');

function buildReceiptNo(cartId) {
  return `RCPT-${Date.now()}-${cartId}`;
}

function toNumber(value) {
  return Number(Number(value).toFixed(2));
}

exports.generateReceiptFromCart = async (cartId, options = {}) => {
  return prisma.$transaction(async (tx) => {
    const cart = await tx.cart.findUnique({
      where: { id: Number(cartId) },
      include: {
        store: true,
        terminal: true,
        items: {
          include: {
            product: true
          }
        },
        payments: {
          orderBy: { id: 'desc' }
        },
        receipt: true
      }
    });

    if (!cart) {
      throw new Error('Cart not found');
    }

    if (cart.receipt) {
      return tx.receipt.findUnique({
        where: { cartId: cart.id },
        include: {
          store: true,
          cart: {
            include: {
              items: {
                include: {
                  product: true
                }
              },
              payments: true
            }
          },
          payment: true
        }
      });
    }

    if (!cart.items.length) {
      throw new Error('Cart has no items');
    }

    const lineItems = cart.items.map((item) => {
      const vatRate = Number(item.product.vatRate || 0);
      const subtotal = toNumber(item.unitPrice * item.qty);
      const tax = toNumber(subtotal * (vatRate / 100));

      return {
        productId: item.productId,
        barcode: item.product.barcode,
        name: item.product.name,
        qty: item.qty,
        unitPrice: item.unitPrice,
        subtotal,
        tax,
        total: toNumber(subtotal + tax)
      };
    });

    const subtotal = toNumber(lineItems.reduce((sum, item) => sum + item.subtotal, 0));
    const taxTotal = toNumber(lineItems.reduce((sum, item) => sum + item.tax, 0));
    const discountTotal = toNumber(Number(options.discountTotal || 0));
    const total = toNumber(subtotal + taxTotal - discountTotal);
    const payment = cart.payments[0] || null;
    const receiptNo = options.receiptNo || buildReceiptNo(cart.id);

    for (const item of cart.items) {
      const currentProduct = await tx.product.findUnique({
        where: { id: item.productId }
      });

      if (!currentProduct) {
        throw new Error(`Product ${item.productId} not found`);
      }

      if (currentProduct.stockQty < item.qty) {
        throw new Error(`Insufficient stock for ${currentProduct.name}`);
      }

      await tx.product.update({
        where: { id: item.productId },
        data: {
          stockQty: {
            decrement: item.qty
          }
        }
      });

      await tx.inventoryMovement.create({
        data: {
          storeId: cart.storeId,
          productId: item.productId,
          employeeId: options.employeeId ? Number(options.employeeId) : null,
          movementType: 'sale',
          quantityDelta: -item.qty,
          note: `Receipt ${receiptNo}`
        }
      });
    }

    const receipt = await tx.receipt.create({
      data: {
        receiptNo,
        storeId: cart.storeId,
        cartId: cart.id,
        paymentId: payment ? payment.id : null,
        issuedAt: new Date(),
        currency: options.currency || 'USD',
        subtotal,
        taxTotal,
        discountTotal,
        total,
        lineItems
      },
      include: {
        store: true,
        payment: true,
        cart: {
          include: {
            items: {
              include: {
                product: true
              }
            },
            payments: true
          }
        }
      }
    });

    await tx.cart.update({
      where: { id: cart.id },
      data: { status: 'closed' }
    });

    return receipt;
  });
};

exports.getReceipts = async () => {
  return prisma.receipt.findMany({
    orderBy: { issuedAt: 'desc' },
    include: {
      store: true,
      cart: {
        include: {
          items: {
            include: {
              product: true
            }
          },
          payments: true
        }
      },
      payment: true
    }
  });
};

exports.getReceiptById = async (id) => {
  return prisma.receipt.findUnique({
    where: { id: Number(id) },
    include: {
      store: true,
      cart: {
        include: {
          items: {
            include: {
              product: true
            }
          },
          payments: true
        }
      },
      payment: true
    }
  });
};

exports.deleteReceipt = async (id) => {
  return prisma.receipt.delete({
    where: { id: Number(id) }
  });
};