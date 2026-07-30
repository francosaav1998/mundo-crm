import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SellerLandingReact from "@/components/landing/SellerLandingReact";
import { getOfficialDemoCompanySlug } from "@/lib/demo-landings";

// Mapa de companySlug → archivo HTML estático
const COMPANY_LANDING_MAP = {
  claro: "/landings/ohxZn08.html",
  entel: "/landings/GA9CU9o.html",
  movistar: "/landings/cJKWAcQ.html",
  vtr: "/landings/oOn6PS8.html",
  wom: "/landings/v1Lz_Yo.html",
  mundo: "/landings/mundo-fibra.html",
};

export const dynamic = "force-dynamic";

export default async function SellerLandingPage({ params }) {
  const { slug } = await params;
  let companySlug = null;

  // 1. Si es slug demo (demo-claro, demo-mundo, etc.) → compañía directo
  const demoCompany = getOfficialDemoCompanySlug(slug);
  if (demoCompany) {
    companySlug = demoCompany;
  }

  // 2. Si no es demo, buscar vendedor real en BD
  if (!companySlug) {
    const seller = await prisma.seller.findUnique({
      where: { slug },
      include: { company: true },
    });
    if (seller) {
      // Vendedor inactivo → landing React con pantalla de pausa
      if (seller.active === false) {
        return <SellerLandingReact />;
      }
      companySlug = seller.company?.slug || null;
    }
  }

  // 3. Si tenemos compañía y existe HTML para ella → redirigir
  if (companySlug && COMPANY_LANDING_MAP[companySlug]) {
    redirect(`${COMPANY_LANDING_MAP[companySlug]}?slug=${encodeURIComponent(slug)}`);
  }

  // 4. Sin compañía conocida → homepage
  redirect("/");
}
