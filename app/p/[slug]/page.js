import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SellerLandingReact from "@/components/landing/SellerLandingReact";
import { buildDemoSeller, getDemoCompanySlug } from "@/lib/demo-seller";

export const dynamic = "force-dynamic";

export default async function SellerLandingPage({ params }) {
  const { slug } = await params;

  // Las demos oficiales solo se sirven desde sus landings clasicas.
  if (getDemoCompanySlug(slug)) {
    notFound();
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
