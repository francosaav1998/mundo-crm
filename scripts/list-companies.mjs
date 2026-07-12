import { prisma } from "../lib/prisma.js";

async function main() {
  const companies = await prisma.company.findMany({
    orderBy: { order: "asc" },
  });

  console.log(JSON.stringify(companies, null, 2));
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
