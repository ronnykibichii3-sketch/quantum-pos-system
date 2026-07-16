const prisma = require('../prismaClient');

async function main() {
  const result = await prisma.product.updateMany({
    where: { name: { contains: 'Milk' } },
    data: { stockQty: 50 }
  });
  console.log(result);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
