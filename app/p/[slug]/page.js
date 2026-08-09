import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SellerLandingReact from "@/components/landing/SellerLandingReact";
import { getOfficialDemoCompanySlug } from "@/lib/demo-landings";

export const dynamic = "force-dynamic";

export default async function SellerLandingPage({ params }) {
  const { slug } = await params;
  let companySlug = null;
  let seller = null;

  // 1. Si es slug demo (demo-claro, demo-mundo, etc.) → compañía directo
  const demoCompany = getOfficialDemoCompanySlug(slug);
  if (demoCompany) {
    companySlug = demoCompany;
  }

  // 2. Si no es demo, buscar vendedor real en BD
  if (!companySlug) {
    seller = await prisma.seller.findUnique({
      where: { slug },
      include: { company: true },
    });
    if (seller) {
      companySlug = seller.company?.slug || null;
    }
  }

  // Todas las compañías usan la landing React para compartir la configuración
  // del dashboard, incluido el fondo opcional del hero.
  if (companySlug || seller) {
    return <SellerLandingReact />;
  }

  // Sin compañía conocida → homepage
  redirect("/");
}
