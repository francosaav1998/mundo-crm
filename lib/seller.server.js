import { prisma } from "@/lib/prisma";
import { slugify, inferGender } from "@/lib/seller";

const DEFAULT_COMPANY_SLUG = "mundo";

export async function findOrCreateSellerForUser(user, companySlug) {
  const userId = user.id;
  const userEmail = user.email || "";
  const fullName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    userEmail.split("@")[0] ||
    "Ejecutiva Mundo";

  const chosenSlug = companySlug || user.user_metadata?.company || DEFAULT_COMPANY_SLUG;

  let seller = await prisma.seller.findUnique({ where: { userId } });

  if (!seller && userEmail) {
    seller = await prisma.seller.findFirst({ where: { email: userEmail } });
    if (seller && !seller.userId) {
      seller = await prisma.seller.update({
        where: { id: seller.id },
        data: { userId },
      });
    }
  }

  let company = await prisma.company.findUnique({ where: { slug: chosenSlug } });
  if (!company) {
    company = await prisma.company.findUnique({ where: { slug: DEFAULT_COMPANY_SLUG } });
  }

  if (!seller) {
    let slug = slugify(fullName);
    const existing = await prisma.seller.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
    }

    seller = await prisma.seller.create({
      data: {
        userId,
        slug,
        name: fullName.slice(0, 100),
        email: userEmail.slice(0, 254),
        gender: inferGender(fullName),
        companyId: company?.id || null,
      },
    });
  } else if (company && !seller.companyId) {
    // Solo asigna compañía si el seller aún no tiene una. Nunca la cambia.
    seller = await prisma.seller.update({
      where: { id: seller.id },
      data: { companyId: company.id },
    });
  }

  return seller;
}
