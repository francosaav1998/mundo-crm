const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  await prisma.$connect();
  const count = await prisma.lead.count();
  console.log('✅ Connected to Supabase PostgreSQL');
  console.log('Lead count:', count);
}

main()
  .catch((err) => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
