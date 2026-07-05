import { prisma } from "@/lib/prisma";
import { slugify, inferGender } from "@/lib/seller";

export async function findOrCreateSellerForUser(user) {
  const userId = user.id;
  const userEmail = user.email || "";
  const fullName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    userEmail.split("@")[0] ||
    "Ejecutiva Mundo";

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
      },
    });
  }

  return seller;
}
