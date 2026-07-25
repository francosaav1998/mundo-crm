import B2BLandingPage from "@/components/B2BLandingPage";
import { getB2BLandingContent } from "@/lib/b2b-landing.server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "CRM Vendedor Mundo | Gestiona tus clientes y vende más",
  description: "Accede al CRM Vendedor Mundo: tu web profesional, leads calificados, seguimiento automático y mensajes masivos por WhatsApp. Prueba 7 días gratis.",
};

export default async function Home() {
  const { css, body } = await getB2BLandingContent();
  return <B2BLandingPage css={css} body={body} />;
}
