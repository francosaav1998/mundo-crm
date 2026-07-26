import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import {
  getCompanyConfig,
  getCompanyVars,
  getLogoUrl,
  shouldInvertLogo,
} from "@/lib/company";

export const metadata = {
  title: "Términos y Condiciones",
  description:
    "Conoce los términos y condiciones de uso de nuestra plataforma de CRM y landings para vendedores independientes.",
};

export default async function TerminosPage({ searchParams }) {
  const params = await searchParams;
  const slug = params?.company || "mundo";
  const config = getCompanyConfig(slug);

  let company = await prisma.company.findUnique({ where: { slug } });
  if (!company) {
    company = {
      slug: "mundo",
      name: "Mundo",
      brandColor: "#00748E",
      brandColorDark: "#005A6F",
      secondaryColor: "#FDDC02",
      accentColor: "#FF8000",
      logoUrl: config.logoDarkHeader,
    };
  }

  const vars = getCompanyVars(company);
  const logoUrl = getLogoUrl(company, "header");
  const invertLogo = shouldInvertLogo(company);
  const termsUrl = `/terminos-y-condiciones?company=${company.slug}`;
  const policyUrl = `/politica-de-privacidad?company=${company.slug}`;
  const homeUrl = company.slug === "mundo" ? "/" : `/p/demo-${company.slug}`;

  return (
    <div data-company={company.slug} style={vars}>
      <link rel="stylesheet" href={config.googleFontUrl} />
      <div className="header-top">
        <div className="container">
          <div className="header-top-info">
            <span>
              <i className="bi bi-clock-fill"></i> Atención Express: Lun a Dom 9:00 a 21:00
            </span>
            <span>
              <i className="bi bi-geo-alt-fill"></i> Cobertura en todo Chile
            </span>
          </div>
          <div>
            <span>Ejecutivo/a de Ventas Oficial {company.name}</span>
          </div>
        </div>
      </div>

      <header className="site-header">
        <div className="container">
          <nav className="main-nav">
            <Link href={homeUrl} className="logo">
              <Image
                src={logoUrl}
                alt={`${company.name} Logo`}
                width={120}
                height={40}
                style={{
                  objectFit: "contain",
                  filter: invertLogo ? "brightness(0) invert(1)" : "none",
                }}
              />
            </Link>
            <ul className="nav-links">
              <li>
                <Link href={homeUrl}>Volver al inicio</Link>
              </li>
              <li>
                <Link href={policyUrl}>Política de Privacidad</Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="privacy-main">
        <div className="container">
          <div className="privacy-card">
            <div className="privacy-header">
              <Link href={homeUrl} className="privacy-back">
                <i className="bi bi-arrow-left"></i>
                Volver al inicio
              </Link>

              <h1>Términos y Condiciones</h1>
              <p className="privacy-date">Última actualización: 04 de julio de 2026</p>
            </div>

            <div className="privacy-content">
              <p>
                Bienvenido/a a <strong>Gestion Vendedores</strong>. Estos Términos y Condiciones regulan el uso de nuestra plataforma de CRM, landings de captación y herramientas comerciales (en adelante, la Plataforma). Al registrarte, iniciar sesión o utilizar cualquiera de nuestros servicios, aceptás cumplir con lo aquí establecido.
              </p>

              <h2>1. Objeto del servicio</h2>
              <p>
                Gestion Vendedores es una herramienta tecnológica que permite a vendedores independientes crear su propia página de captación (landing), gestionar prospectos, realizar seguimiento comercial y automatizar parte de su proceso de ventas.
              </p>

              <h2>2. Registro y cuentas de vendedor</h2>
              <p>
                Para usar la Plataforma debes crear una cuenta con datos veraces y mantenerlos actualizos. Cada vendedor registrado recibe su propia landing independiente, bajo su responsabilidad, con un enlace personalizado o subdominio asociado a su cuenta.
              </p>
              <p>
                La cuenta es personal e intransferible. Vos sos responsable de toda actividad realizada desde tu cuenta, incluyendo el contenido publicado en tu landing y el trato con tus prospectos.
              </p>

              <h2>3. Responsabilidad sobre contenido, logos e información de compañías</h2>
              <p>
                Este es un punto importante: <strong>cada vendedor es responsable exclusivo del uso que haga en su landing de los logotipos, marcas, nombres comerciales, imágenes, textos y cualquier información relacionada con las compañías cuyos servicios comercializa</strong>.
              </p>
              <p>
                Al registrarte en Gestion Vendedores y activar tu landing, declaras que:
              </p>
              <ul>
                <li>Tenés autorización o la relación comercial necesaria para ofrecer los servicios de esas compañías.</li>
                <li>El uso de los logos, marcas y contenido de terceros en tu landing no infringe derechos de propiedad intelectual, marcas comerciales ni normativa aplicable.</li>
                <li>Sos el único responsable de la veracidad de la información publicada en tu landing, incluyendo precios, promociones, planes y condiciones de contratación.</li>
                <li>Gestion Vendedores no es parte de la relación comercial entre el vendedor, la compañía y el cliente final.</li>
              </ul>
              <p>
                Gestion Vendedores actúa únicamente como proveedor tecnológico de la herramienta. No somos responsables por publicidad engañosa, promesas incumplidas, uso no autorizado de marcas ni por el contenido generado por cada vendedor en su landing independiente.
              </p>

              <h2>4. Uso permitido y prohibido</h2>
              <p>
                Está prohibido utilizar la Plataforma para actividades ilegales, fraudulentas, spam masivo no autorizado, phishing, suplantación de identidad o cualquier uso que pueda dañar a Gestion Vendedores, a otras cuentas o a terceros.
              </p>
              <p>
                Podemos suspender, desactivar o eliminar tu cuenta y tu landing si detectamos incumplimiento de estos términos, uso indebido de marcas o contenido reportado por terceros.
              </p>

              <h2>5. Planes, prueba gratis, pagos y cancelación</h2>
              <p>
                La Plataforma ofrece un período de prueba gratis de 7 días desde el registro. Al finalizar la prueba, el servicio requiere el pago de la suscripción mensual según el plan contratado.
              </p>
              <p>
                Los pagos se procesan a través de Mercado Pago u otro proveedor autorizado. La facturación es recurrente y podés cancelar tu suscripción en cualquier momento desde tu dashboard. No realizamos reembolsos por meses ya facturados salvo obligación legal.
              </p>

              <h2>6. Propiedad intelectual</h2>
              <p>
                El software, diseños, código, textos propios de la Plataforma y la marca Gestion Vendedores son propiedad de sus respectivos titulares. El vendedor conserva la propiedad de los datos de sus prospectos, pero otorga a Gestion Vendedores una licencia limitada para almacenarlos y procesarlos a fin de prestar el servicio.
              </p>

              <h2>7. Limitación de responsabilidad</h2>
              <p>
                Gestion Vendedores no garantiza resultados comerciales específicos ni se hace responsable por pérdidas de ventas, inhabilitaciones de cuentas publicitarias o sanciones derivadas del contenido publicado por cada vendedor.
              </p>

              <h2>8. Modificaciones</h2>
              <p>
                Nos reservamos el derecho de actualizar estos Términos y Condiciones en cualquier momento. Los cambios importantes serán comunicados por correo electrónico o al iniciar sesión en la Plataforma. El uso continuado del servicio después de cualquier modificación implica la aceptación de los nuevos términos.
              </p>

              <h2>9. Legislación aplicable y contacto</h2>
              <p>
                Estos términos se rigen por las leyes de la República de Chile. Para cualquier consulta, reclamo o ejercicio de derechos, podés contactarnos a través de los medios publicados en el sitio principal o desde tu dashboard.
              </p>
            </div>

            <div className="privacy-footer">
              <Link href={homeUrl} className="btn btn-primary">
                <i className="bi bi-house-door-fill"></i>
                Volver a la página principal
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="site-footer">
        <div className="container">
          <div className="footer-bottom">
            <p>
              &copy; 2026 {company.name}. Página web de Ejecutivo/a de Ventas Oficial Independiente.
            </p>
            <p style={{ marginTop: "0.5rem", fontSize: "0.75rem" }}>
              Los logotipos, marcas comerciales y nombres de servicios exhibidos en este sitio son
              propiedad exclusiva de {company.name} y sus filiales. Este sitio tiene propósitos
              informativos y de captación comercial por parte de una ejecutiva oficial independiente.
            </p>
            <p style={{ marginTop: "0.75rem" }}>
              <Link
                href={termsUrl}
                className="text-[var(--color-primary)] hover:underline font-medium"
              >
                Términos y Condiciones
              </Link>
              {" · "}
              <Link
                href={policyUrl}
                className="text-[var(--color-primary)] hover:underline font-medium"
              >
                Política de Privacidad y Cookies
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
