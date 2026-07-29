import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SellerLandingReact from "@/components/landing/SellerLandingReact";

const STATIC_LANDINGS = ["movistar", "claro", "vtr", "wom", "entel"];

export const dynamic = "force-dynamic";

export default async function SellerLandingPage({ params, searchParams }) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === "1";

  const seller = await prisma.seller.findUnique({
    where: { slug },
    include: { company: true },
  });

  if (!seller) {
    redirect("/");
  }

  if (seller.active === false) {
    // Renderiza la landing React pausada (tiene su propia pantalla de inactivo).
    return <SellerLandingReact />;
  }

  const companySlug = seller.company?.slug || "mundo";

  // Para las compañías con landing estática profesional, redirigimos a ella.
  // El slug se pasa como query param para que seller-dynamic.js cargue los datos.
  if (!isPreview && STATIC_LANDINGS.includes(companySlug)) {
    redirect(`/landings/${companySlug}.html?slug=${encodeURIComponent(slug)}`);
  }

  // Preview del editor o compañías sin landing estática (ej. Mundo) usan la landing React.
  return <SellerLandingReact />;
}
