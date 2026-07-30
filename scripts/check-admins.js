const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const admins = await prisma.admin.findMany();
  console.log('Current Admins in DB:', admins);

  const userEmail = 'tousifansari75676@gmail.com';
  const hashedPass = await bcrypt.hash('pushya2024', 12);

  // Upsert user's email so both tousifansari75676@gmail.com and admin@pushya.com work!
  const userAdmin = await prisma.admin.upsert({
    where: { email: userEmail },
    update: { password: hashedPass },
    create: {
      email: userEmail,
      password: hashedPass,
      name: 'Tousif Ansari',
      role: 'ADMIN',
    },
  });

  console.log('✅ Added/Updated Admin for:', userAdmin.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
