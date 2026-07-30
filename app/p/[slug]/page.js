import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SellerLandingReact from "@/components/landing/SellerLandingReact";
import { getOfficialDemoHash } from "@/lib/demo-landings";
import { buildDemoSeller, getDemoCompanySlug } from "@/lib/demo-seller";

export const dynamic = "force-dynamic";

export default async function SellerLandingPage({ params, searchParams }) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === "1";

  // Las demos antiguas quedan bloqueadas; Mundo conserva la landing de vendedor.
  if (getDemoCompanySlug(slug) && getDemoCompanySlug(slug) !== "mundo") {
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

  const hash = getOfficialDemoHash(seller.company?.slug);
  const query = seller.id
    ? `id=${encodeURIComponent(seller.id)}`
    : `slug=${encodeURIComponent(slug)}`;

  if (!isPreview && hash) {
    redirect(`/landings/${hash}.html?${query}`);
  }

  return <SellerLandingReact />;
}
