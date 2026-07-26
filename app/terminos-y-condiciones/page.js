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
                Bienvenido/a a <strong>Gestion Vendedores</strong>. Estos Términos y Condiciones regulan el acceso y uso de nuestra plataforma de CRM, landings de captación y herramientas comerciales (en adelante, la Plataforma). Al registrarte, iniciar sesión o utilizar cualquiera de nuestros servicios, aceptás de forma expresa e irrevocable cumplir con lo aquí establecido.
              </p>

              <h2>1. Objeto del servicio</h2>
              <p>
                Gestion Vendedores es una plataforma tecnológica que permite a vendedores independientes crear una página de captación (landing) propia, gestionar prospectos, realizar seguimiento comercial y automatizar parte de su proceso de ventas. La Plataforma no comercializa directamente los servicios de las compañías: solo facilita las herramientas para que cada vendedor lo haga de forma autónoma.
              </p>

              <h2>2. Registro y cuentas de vendedor</h2>
              <p>
                Para usar la Plataforma debes crear una cuenta con datos veraces, completos y mantenerlos actualizados. Cada cuenta de vendedor genera una landing independiente, bajo un enlace personalizado o subdominio propio de ese vendedor. La cuenta y la landing son personales e intransferibles.
              </p>
              <p>
                El Vendedor es el único responsable de toda actividad realizada desde su cuenta, incluyendo el diseño, textos, imágenes, logos, precios, promociones y cualquier otro contenido publicado en su landing, así como el trato, seguimiento y cierre comercial con sus prospectos.
              </p>

              <h2>3. Landing independiente y responsabilidad por contenido de terceros</h2>
              <p>
                <strong>Cada vendedor opera su propia landing independiente.</strong> Gestion Vendedores no edita, controla ni aprueba el contenido publicado por los vendedores. El Vendedor es responsable exclusivo de:
              </p>
              <ul>
                <li>La información, imágenes, textos, precios, planes y condiciones de contratación que publique en su landing.</li>
                <li>El uso de logotipos, marcas, nombres comerciales, slogans, colores corporativos y cualquier material de identidad visual perteneciente a terceras compañías cuyos servicios comercializa.</li>
                <li>Garantizar que cuenta con la autorización, relación comercial, contrato, acuerdo o habilitación correspondiente para usar dichos materiales y ofrecer dichos servicios.</li>
                <li>Asegurar que el contenido no infringe derechos de propiedad intelectual, derechos de marca, normas de publicidad, leyes de protección al consumidor ni cualquier otra normativa aplicable.</li>
              </ul>
              <p>
                Al registrarse y activar su landing, el Vendedor declara bajo su responsabilidad que el uso de los logos, marcas e información de las compañías es legítimo y autorizado. Cualquier reclamo, denuncia, demanda o sanción derivada del contenido publicado recaerá exclusivamente sobre el Vendedor.
              </p>

              <h2>4. Posición de Gestion Vendedores</h2>
              <p>
                Gestion Vendedores actúa únicamente como proveedor tecnológico de la herramienta. No somos agente, representante, empleador, intermediario comercial ni parte de la relación entre el Vendedor, la compañía cuyos servicios se ofrecen y el cliente final.
              </p>
              <p>
                En consecuencia, Gestion Vendedores no se hace responsable por publicidad engañosa, promesas incumplidas, errores en precios, usos no autorizados de marcas, incumplimientos contractuales, daños a terceros ni por el contenido generado y publicado por cada vendedor en su landing independiente.
              </p>

              <h2>5. Uso permitido y prohibido</h2>
              <p>
                Está prohibido utilizar la Plataforma para actividades ilegales, fraudulentas, spam masivo no autorizado, phishing, suplantación de identidad, venta de datos de terceros o cualquier uso que pueda dañar a Gestion Vendedores, a otras cuentas o a terceros.
              </p>
              <p>
                Gestion Vendedores se reserva el derecho de suspender, desactivar o eliminar la cuenta y la landing de un vendedor, sin previo aviso, si detecta incumplimiento de estos términos, uso indebido de marcas o contenido reportado por terceros.
              </p>

              <h2>6. Indemnidad</h2>
              <p>
                El Vendedor se obliga a mantener indemne a Gestion Vendedores, sus representantes, empleados, proveedores y socios ante cualquier reclamo, demanda, sanción, multa, costo o gasto —incluyendo honorarios de abogados— derivado del contenido publicado en su landing, del uso no autorizado de marcas o materiales de terceros, o del incumplimiento de estos Términos y Condiciones.
              </p>

              <h2>7. Planes, prueba gratis, pagos y cancelación</h2>
              <p>
                La Plataforma ofrece un período de prueba gratis de 7 días desde el registro. Al finalizar la prueba, el servicio requiere el pago de la suscripción mensual según el plan contratado.
              </p>
              <p>
                Los pagos se procesan a través de Mercado Pago u otro proveedor autorizado. La facturación es recurrente y el Vendedor puede cancelar su suscripción en cualquier momento desde su dashboard. No se realizarán reembolsos por meses ya facturados, salvo obligación legal expresa.
              </p>

              <h2>8. Propiedad intelectual</h2>
              <p>
                El software, diseños, código, textos propios de la Plataforma y la marca Gestion Vendedores son propiedad de sus respectivos titulares. El Vendedor conserva la propiedad de los datos de sus prospectos, pero otorga a Gestion Vendedores una licencia limitada para almacenarlos y procesarlos a fin de prestar el servicio.
              </p>

              <h2>9. Limitación de responsabilidad</h2>
              <p>
                Gestion Vendedores no garantiza resultados comerciales específicos, número de prospectos, conversiones ni ventas. Tampoco se hace responsable por pérdidas de ingresos, inhabilitaciones de cuentas publicitarias, bloqueos de dominios o sanciones derivadas del contenido publicado por cada vendedor en su landing independiente.
              </p>

              <h2>10. Modificaciones</h2>
              <p>
                Gestion Vendedores se reserva el derecho de actualizar estos Términos y Condiciones en cualquier momento. Los cambios importantes serán comunicados por correo electrónico o al iniciar sesión en la Plataforma. El uso continuado del servicio después de cualquier modificación implica la aceptación de los nuevos términos.
              </p>

              <h2>11. Legislación aplicable y contacto</h2>
              <p>
                Estos términos se rigen por las leyes de la República de Chile. Para cualquier consulta, reclamo o ejercicio de derechos, el Vendedor puede contactarnos a través de los medios publicados en el sitio principal o desde su dashboard.
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
