const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const updated = await prisma.restaurantSettings.upsert({
    where: { id: "default" },
    update: {
      openingTime: "08:00 AM",
      closingTime: "11:00 PM",
      isAcceptingOrders: true,
      statusMode: "ACCEPTING",
      holidayMode: false,
    },
    create: {
      id: "default",
      openingTime: "08:00 AM",
      closingTime: "11:00 PM",
      isAcceptingOrders: true,
      statusMode: "ACCEPTING",
      holidayMode: false,
    },
  });

  console.log("✅ Updated Restaurant Settings in DB:", updated);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
