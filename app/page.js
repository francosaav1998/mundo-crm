import { getB2BLandingContent, B2B_LANDING_CSS_KEY } from "@/lib/b2b-landing.server";
import { DEFAULT_B2B_LANDING_CSS, DEFAULT_B2B_LANDING_BODY } from "@/lib/b2b-landing";
import Script from "next/script";
import { normalizeB2BBranding } from "@/lib/b2b-branding";

export const metadata = {
  title: "GestionVendedores.com | CRM y landings para equipos comerciales",
  description: "GestionVendedores.com: CRM, landings, captación de leads, WhatsApp y facturación para vendedores y equipos comerciales.",
};

// La portada B2B se renderiza desde el contenido guardado en la base de datos
// (key: b2b-landing-body) para que el admin pueda editarla desde el dashboard.
export const dynamic = "force-dynamic";

export default async function Home() {
  const { css, body } = await getB2BLandingContent();
  const landingCss = css || DEFAULT_B2B_LANDING_CSS;
  const landingBody = normalizeB2BBranding(body || DEFAULT_B2B_LANDING_BODY);

  return (
    <>
      <style key={B2B_LANDING_CSS_KEY} dangerouslySetInnerHTML={{ __html: landingCss }} />
      <div dangerouslySetInnerHTML={{ __html: landingBody }} />
      <Script id="b2b-landing-menu" strategy="afterInteractive">
        {`
          (function () {
            function initMenu() {
              var menuToggle = document.getElementById('menuToggle');
              var navLinks = document.getElementById('navLinks');
              if (!menuToggle || !navLinks || menuToggle.dataset.bound === 'true') return;

              menuToggle.dataset.bound = 'true';

              menuToggle.addEventListener('click', function () {
                navLinks.classList.toggle('mobile-active');
                document.body.classList.toggle('menu-open', navLinks.classList.contains('mobile-active'));
              });

              navLinks.querySelectorAll('a').forEach(function (link) {
                link.addEventListener('click', function () {
                  navLinks.classList.remove('mobile-active');
                  document.body.classList.remove('menu-open');
                });
              });
            }

            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', initMenu);
            } else {
              initMenu();
            }
          })();
        `}
      </Script>
    </>
  );
}
