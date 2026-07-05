import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuth, isAdmin } from "@/lib/auth";
import { findOrCreateSellerForUser } from "@/lib/seller.server";
import DashboardClient from "@/components/DashboardClient";

export const dynamic = "force-dynamic";

const INITIAL_LIMIT = 25;

export default async function DashboardPage() {
  let session;
  try {
    session = await requireAuth();
  } catch {
    redirect("/dashboard/login");
  }

  const admin = isAdmin(session.user);
  const userId = session.user?.id;

  let seller = null;
  let sellerWhere = {};

  if (!admin) {
    seller = await findOrCreateSellerForUser(session.user);
    sellerWhere = { sellerId: seller.id };
  }

  const [initialLeads, initialTotal] = await prisma.$transaction([
    prisma.lead.findMany({
      where: sellerWhere,
      orderBy: { createdAt: "desc" },
      take: INITIAL_LIMIT,
      select: { id: true, name: true, phone: true, city: true, plan: true, status: true, createdAt: true },
    }),
    prisma.lead.count({ where: sellerWhere }),
  ]);

  return (
    <DashboardClient
      initialLeads={initialLeads}
      initialTotal={initialTotal}
      username={session.user?.user_metadata?.name || session.user?.email || "Admin"}
      isAdmin={admin}
      sellerSlug={seller?.slug || null}
      sellerInfo={seller ? {
        photo: seller.photo,
        bio: seller.bio,
        phone: seller.phone,
        name: seller.name,
      } : null}
    />
  );
}
