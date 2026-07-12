import { prisma } from "../lib/prisma.js";

const slugs = ["movistar", "claro", "vtr", "wom", "entel", "mundo"];

for (const s of slugs) {
  const company = await prisma.company.findUnique({ where: { slug: s } });
  if (!company) {
    console.log(`Compañía no encontrada: ${s}`);
    continue;
  }
  const demoSlug = `demo-${s}`;
  await prisma.seller.upsert({
    where: { slug: demoSlug },
    update: { companyId: company.id },
    create: {
      slug: demoSlug,
      name: `Demo ${company.name}`,
      email: `${demoSlug}@example.com`,
      phone: "56912345678",
      companyId: company.id,
    },
  });
  console.log(`http://localhost:3000/p/${demoSlug}`);
}

await prisma.$disconnect();
