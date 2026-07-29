import { getB2BLandingContent, B2B_LANDING_CSS_KEY } from "@/lib/b2b-landing.server";
import { DEFAULT_B2B_LANDING_CSS, DEFAULT_B2B_LANDING_BODY } from "@/lib/b2b-landing";

export const metadata = {
  title: "Mundo CRM | Una plataforma para todos tus equipos comerciales",
  description: "Gestiona prospectos, seguimientos y ventas de Mundo, VTR, Claro, WOM, Entel y Movistar desde una sola plataforma.",
};

// La portada B2B se renderiza desde el contenido guardado en la base de datos
// (key: b2b-landing-body) para que el admin pueda editarla desde el dashboard.
export const dynamic = "force-dynamic";

export default async function Home() {
  const { css, body } = await getB2BLandingContent();
  const landingCss = css || DEFAULT_B2B_LANDING_CSS;
  const landingBody = body || DEFAULT_B2B_LANDING_BODY;

  return (
    <>
      <style key={B2B_LANDING_CSS_KEY} dangerouslySetInnerHTML={{ __html: landingCss }} />
      <div dangerouslySetInnerHTML={{ __html: landingBody }} />
    </>
  );
}
