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
      return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}>
          <div style={{ maxWidth: 520, width: "100%", background: "rgba(15,23,42,0.72)", border: "1px solid rgba(148,163,184,0.2)", borderRadius: 24, padding: 32, color: "#fff", textAlign: "center" }}>
            <div style={{ width: 72, height: 72, borderRadius: 20, margin: "0 auto 16px", background: "rgba(239,68,68,0.14)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, color: "#EF4444" }}>
              <i className="bi bi-pause-circle-fill" />
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 10 }}>Tu acceso está pausado</h1>
            <p style={{ color: "rgba(255,255,255,0.78)", lineHeight: 1.6, marginBottom: 18 }}>
              Tu landing y tu dashboard están desactivados temporalmente. Contacta al administrador para reactivar tu cuenta o completa tu facturación si corresponde.
            </p>
            <a href="/dashboard/login" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 18px", borderRadius: 999, background: "#fff", color: "#0f172a", fontWeight: 800, textDecoration: "none" }}>
              <i className="bi bi-arrow-left" /> Volver al login
            </a>
          </div>
        </div>
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
