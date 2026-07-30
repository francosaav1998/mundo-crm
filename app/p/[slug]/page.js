import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SellerLandingReact from "@/components/landing/SellerLandingReact";
const OFFICIAL_LANDING_HASH = "ohxZn08";
import { buildDemoSeller, getDemoCompanySlug } from "@/lib/demo-seller";

export const dynamic = "force-dynamic";

export default async function SellerLandingPage({ params, searchParams }) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === "1";

  if (!isPreview) {
    redirect(`/landings/${OFFICIAL_LANDING_HASH}.html?slug=${encodeURIComponent(slug)}`);
  }

  let seller = await prisma.seller.findUnique({
    where: { slug },
    include: { company: true },
  });

  if (!seller) {
    const companySlug = getDemoCompanySlug(slug);
    if (companySlug) {
      const company = await prisma.company.findUnique({ where: { slug: companySlug } });
      if (company) seller = buildDemoSeller(slug, company);
    }
  }

  if (!seller) {
    redirect("/");
  }

  if (seller.active === false) {
    // Renderiza la landing React pausada (tiene su propia pantalla de inactivo).
    return <SellerLandingReact />;
  }

  return <SellerLandingReact />;
}
