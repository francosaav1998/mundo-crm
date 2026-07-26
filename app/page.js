import B2BLandingPage from "@/components/B2BLandingPage";
import { getB2BLandingContent } from "@/lib/b2b-landing.server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Gestion Vendedores | CRM y landings para vender más",
  description: "Gestion Vendedores: tu CRM comercial con landing, leads, seguimiento, WhatsApp masivo y prueba gratis.",
};

export default async function Home() {
  const { css, body } = await getB2BLandingContent();
  return <B2BLandingPage css={css} body={body} />;
}
