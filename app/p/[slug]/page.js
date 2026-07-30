import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SellerLandingReact from "@/components/landing/SellerLandingReact";
import { getOfficialDemoCompanySlug } from "@/lib/demo-landings";

// Mapa de companySlug → archivo HTML estático (Mundo usa React)
const COMPANY_LANDING_MAP = {
  claro: "/landings/ohxZn08.html",
  entel: "/landings/GA9CU9o.html",
  movistar: "/landings/cJKWAcQ.html",
  vtr: "/landings/oOn6PS8.html",
  wom: "/landings/v1Lz_Yo.html",
};

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

  // 3. Mundo siempre usa React (demo-mundo y vendedores reales de Mundo)
  if (companySlug === "mundo") {
    return <SellerLandingReact />;
  }

  // 4. Vendedor inactivo (no Mundo) → pantalla de pausa en React
  if (seller && seller.active === false) {
    return <SellerLandingReact />;
  }

  // 5. Si tenemos compañía y existe HTML para ella → redirigir
  if (companySlug && COMPANY_LANDING_MAP[companySlug]) {
    redirect(`${COMPANY_LANDING_MAP[companySlug]}?slug=${encodeURIComponent(slug)}`);
  }

  // 6. Sin compañía conocida → homepage
  redirect("/");
}
