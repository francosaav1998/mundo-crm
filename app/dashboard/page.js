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
    const sellerRecord = await findOrCreateSellerForUser(session.user);
    seller = await prisma.seller.findUnique({
      where: { id: sellerRecord.id },
      include: { company: true },
    });

    if (!seller?.active) {
      // Cuenta pausada: en vez de una pantalla sin salida, dejamos entrar al
      // dashboard en modo bloqueado con acceso SOLO a Facturación, para que el
      // vendedor pueda registrar su tarjeta y reactivarse automáticamente.
      return (
        <DashboardClient
          initialLeads={[]}
          initialTotal={0}
          username={session.user?.user_metadata?.name || session.user?.email || "Vendedor"}
          isAdmin={false}
          sellerSlug={seller?.slug || null}
          lockedToBilling={true}
          sellerInfo={{
            id: seller.id,
            slug: seller.slug,
            photo: seller.photo,
            bio: seller.bio,
            phone: seller.phone,
            name: seller.name,
            gender: seller.gender,
            landingTheme: seller.landingTheme,
            footerText: seller.footerText,
            bgVideoUrl: seller.bgVideoUrl,
            company: seller.company,
          }}
        />
      );
    }

    sellerWhere = { sellerId: seller.id };
  } else {
    // El admin solo ve su pipeline B2B (vendedores interesados en la plataforma).
    sellerWhere = { sellerId: null };
  }

  const [initialLeads, initialTotal] = await prisma.$transaction([
    prisma.lead.findMany({
      where: sellerWhere,
      orderBy: { createdAt: "desc" },
      take: INITIAL_LIMIT,
      select: { id: true, name: true, phone: true, email: true, city: true, address: true, plan: true, status: true, createdAt: true },
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
        id: seller.id,
        slug: seller.slug,
        photo: seller.photo,
        bio: seller.bio,
        phone: seller.phone,
        name: seller.name,
        gender: seller.gender,
        landingTheme: seller.landingTheme,
        footerText: seller.footerText,
        bgVideoUrl: seller.bgVideoUrl,
        company: seller.company,
      } : null}
    />
  );
}
