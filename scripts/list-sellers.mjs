import { prisma } from "../lib/prisma.js";
import { buildSellerLandingUrl } from "../lib/urls.js";

async function main() {
  const sellers = await prisma.seller.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    include: { company: { select: { name: true, slug: true } } },
  });

  const list = sellers.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    email: s.email,
    phone: s.phone,
    company: s.company?.name || "Sin compañía",
    landingUrl: buildSellerLandingUrl(s.slug, {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    }),
  }));

  console.log(JSON.stringify(list, null, 2));
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
