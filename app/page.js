import B2BLandingPage from "@/components/B2BLandingPage";
import B2BPreviewBridge from "@/components/B2BPreviewBridge";
import { getB2BContent } from "@/lib/b2b-landing.server";

export const metadata = {
  title: "Mundo CRM | Una plataforma para todos tus equipos comerciales",
  description: "Gestiona prospectos, seguimientos y ventas de Mundo, VTR, Claro, WOM, Entel y Movistar desde una sola plataforma.",
};

// La portada lee el contenido editado por el admin en cada request.
export const dynamic = "force-dynamic";

export default async function Home({ searchParams }) {
  const params = await searchParams;
  const content = await getB2BContent();

  if (params?.preview === "1") {
    return <B2BPreviewBridge initialContent={content} />;
  }

  return <B2BLandingPage content={content} />;
}
