import { prisma } from "../lib/prisma.js";

async function main() {
  const sellers = await prisma.seller.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    include: { company: { select: { name: true, slug: true } } },
  });

  const baseUrl = "http://localhost:3000";
  const list = sellers.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    email: s.email,
    phone: s.phone,
    company: s.company?.name || "Sin compañía",
    landingUrl: `${baseUrl}/p/${s.slug}`,
  }));

  console.log(JSON.stringify(list, null, 2));
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
