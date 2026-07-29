const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.restaurantSettings.update({
    where: { id: 'default' },
    data: { openingTime: '08:00 AM' },
  });
  console.log('✅ Opening time updated to:', result.openingTime);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
