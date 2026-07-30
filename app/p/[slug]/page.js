import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SellerLandingReact from "@/components/landing/SellerLandingReact";
import { buildDemoSeller, getDemoCompanySlug } from "@/lib/demo-seller";

export const dynamic = "force-dynamic";

export default async function SellerLandingPage({ params }) {
  const { slug } = await params;

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
      const company =
        (await prisma.company.findUnique({ where: { slug: companySlug } })) ||
        (companySlug === "mundo"
          ? {
              slug: "mundo",
              name: "Mundo",
              brandColor: "#00748E",
              brandColorDark: "#005A6F",
              secondaryColor: "#FDDC02",
              accentColor: "#FF8000",
              logoUrl: "https://www.tumundo.cl/wp-content/uploads/2022/12/logo-mundo-negative.svg",
              websiteUrl: "https://www.tumundo.cl",
            }
          : null);
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
