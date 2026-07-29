const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Hash the admin password
  const hashed = await bcrypt.hash('pushya2024', 12);
  
  const admin = await prisma.admin.update({
    where: { email: 'admin@pushya.com' },
    data: { password: hashed },
  });
  
  console.log('✅ Admin password updated (bcrypt hashed)');
  console.log('   Email:', admin.email);
  console.log('   Password: pushya2024');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
