const prisma = require('../prismaClient');

exports.recordMovement = async (data) => {
  return prisma.$transaction(async (tx) => {
    const productId = Number(data.productId);
    const storeId = Number(data.storeId);
    const quantityDelta = Number(data.quantityDelta);

    const product = await tx.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      throw new Error('Product not found');
    }

    const nextStock = product.stockQty + quantityDelta;

    if (nextStock < 0) {
      throw new Error('Stock cannot go below zero');
    }

    await tx.product.update({
      where: { id: productId },
      data: { stockQty: nextStock }
    });

    return tx.inventoryMovement.create({
      data: {
        storeId,
        productId,
        employeeId: data.employeeId ? Number(data.employeeId) : null,
        movementType: data.movementType || (quantityDelta >= 0 ? 'adjustment_in' : 'adjustment_out'),
        quantityDelta,
        note: data.note || null
      },
      include: {
        product: true,
        store: true,
        employee: true
      }
    });
  });
};

exports.getMovements = async () => {
  return prisma.inventoryMovement.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      product: true,
      store: true,
      employee: true
    }
  });
};

exports.getMovementById = async (id) => {
  return prisma.inventoryMovement.findUnique({
    where: { id: Number(id) },
    include: {
      product: true,
      store: true,
      employee: true
    }
  });
};

exports.adjustStock = async (productId, data) => {
  return exports.recordMovement({
    productId,
    storeId: data.storeId,
    employeeId: data.employeeId,
    quantityDelta: data.quantityDelta,
    movementType: data.movementType,
    note: data.note
  });
};

exports.getLowStockProducts = async () => {
  const products = await prisma.product.findMany({
    orderBy: {
      stockQty: 'asc'
    }
  });

  return products.filter((product) => product.stockQty <= product.reorderLevel);
};

exports.getInventorySnapshot = async () => {
  return prisma.product.findMany({
    orderBy: { name: 'asc' }
  });
};