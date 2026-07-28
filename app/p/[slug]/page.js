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

  // Siempre se usa la landing React para mantener la URL limpia /p/[slug].
  // Las compañías como WOM, Entel, etc. se renderizan con su branding y planes
  // gracias a que SellerLandingReact los carga dinámicamente.
  return <SellerLandingReact />;
}
