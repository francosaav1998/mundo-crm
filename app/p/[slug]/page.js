import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SellerLandingReact from "@/components/landing/SellerLandingReact";
import { buildDemoSeller, getDemoCompanySlug } from "@/lib/demo-seller";

const LANDING_HASHES = {
  claro: "ohxZn08",
  entel: "GA9CU9o",
  movistar: "cJKWAcQ",
  vtr: "oOn6PS8",
  wom: "v1Lz_Yo",
};

export const dynamic = "force-dynamic";

export default async function SellerLandingPage({ params, searchParams }) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === "1";

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

  const companySlug = seller.company?.slug || "mundo";
  const hash = LANDING_HASHES[companySlug];
  const query = seller.id
    ? `id=${encodeURIComponent(seller.id)}`
    : `slug=${encodeURIComponent(slug)}`;

  if (!isPreview && hash) {
    redirect(`/landings/${hash}.html?${query}`);
  }

  return <SellerLandingReact />;
}
