import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SellerLandingReact from "@/components/landing/SellerLandingReact";

// Mapeo de compañía → hash del archivo HTML (para no exponer la compañía en la URL)
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

  // Redirigir a landing estática con nombre de archivo hasheado
  const hash = LANDING_HASHES[companySlug];
  if (!isPreview && hash) {
    redirect(`/landings/${hash}.html?id=${encodeURIComponent(seller.id)}`);
  }

  // Preview del editor o compañías sin landing estática (ej. Mundo) usan la landing React.
  return <SellerLandingReact />;
}
