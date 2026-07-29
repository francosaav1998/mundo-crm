import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SellerLandingReact from "@/components/landing/SellerLandingReact";

export const dynamic = "force-dynamic";

export default async function SellerLandingPage({ params }) {
  const { slug } = await params;

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

  return <SellerLandingReact />;
}
