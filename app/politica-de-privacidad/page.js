import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Política de Privacidad | Tu Asesora Mundo",
  description: "Conoce cómo protegemos tus datos personales y cómo usamos cookies y tecnologías de seguimiento en nuestro sitio.",
};

export default function PoliticaPrivacidadPage() {
  return (
    <div className="privacy-page">
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
            <span>Ejecutivo/a de Ventas Oficial Mundo</span>
          </div>
        </div>
      </div>

      <header className="site-header">
        <div className="container">
          <nav className="main-nav">
            <Link href="/" className="logo">
              <Image
                src="https://www.tumundo.cl/wp-content/uploads/2022/12/logo-mundo-negative.svg"
                alt="Mundo Logo"
                width={120}
                height={32}
              />
            </Link>
            <ul className="nav-links">
              <li>
                <Link href="/">Volver al inicio</Link>
              </li>
              <li>
                <Link href="/politica-de-privacidad">Política de Privacidad</Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="privacy-main">
        <div className="container">
          <div className="privacy-card">
            <div className="privacy-header">
              <Link
                href="/"
                className="privacy-back"
              >
                <i className="bi bi-arrow-left"></i>
                Volver al inicio
              </Link>

              <h1>Política de Privacidad</h1>
              <p className="privacy-date">
                Última actualización: 04 de julio de 2026
              </p>
            </div>

            <div className="privacy-content">
              <p>
                En <strong>Tu Asesora Mundo</strong> nos tomamos muy en serio la protección de tus datos
                personales. Esta política explica qué información recopilamos, con qué fines la usamos
                y cuáles son tus derechos como usuario. Este sitio es operado por una ejecutiva de
                ventas autorizada e independiente de Mundo Pacífico S.A. con fines de captación
                comercial.
              </p>

              <h2>1. Responsable del tratamiento</h2>
              <p>
                El responsable del tratamiento de los datos es la ejecutiva comercial independiente que
                opera este sitio, actuando como intermediaria para la gestión de solicitudes de
                información y contratación de servicios de Mundo. Para ejercer tus derechos, podés
                contactarnos a través del formulario de contacto o por WhatsApp publicado en este sitio.
              </p>

              <h2>2. Datos personales que recopilamos</h2>
              <ul>
                <li>Nombre completo</li>
                <li>Teléfono de contacto</li>
                <li>Correo electrónico (opcional)</li>
                <li>Comuna o ciudad de residencia</li>
                <li>Dirección de instalación</li>
                <li>Plan de servicio de interés</li>
              </ul>

              <h2>3. Finalidad del tratamiento</h2>
              <p>Tus datos se utilizan exclusivamente para:</p>
              <ul>
                <li>Gestionar tu solicitud de factibilidad técnica y cotización.</li>
                <li>Contactarte por teléfono, WhatsApp o correo electrónico para coordinar la instalación.</li>
                <li>Enviarte información comercial relacionada con planes y promociones de Mundo.</li>
                <li>Cumplir con obligaciones legales y regulatorias.</li>
              </ul>

              <h2>4. Base legal</h2>
              <p>
                El tratamiento de tus datos se basa en tu consentimiento, otorgado al completar y
                enviar el formulario de contacto. Al hacerlo, declarás que los datos proporcionados son
                veraces y que tenés facultades para compartirlos.
              </p>

              <h2>5. Cookies y tecnologías de seguimiento</h2>
              <p>
                Este sitio utiliza cookies y tecnologías similares para mejorar tu experiencia y medir
                el rendimiento de nuestras campañas publicitarias. En particular, podemos utilizar el
                Meta Pixel de Facebook/Instagram para entender cómo los usuarios interactúan con el
                sitio después de ver nuestros anuncios. Estas herramientas pueden recopilar información
                anonimizada sobre tu navegación.
              </p>
              <p>
                Podés deshabilitar las cookies desde la configuración de tu navegador. Para más
                información sobre cómo Meta utiliza tus datos, visitá la{" "}
                <a
                  href="https://www.facebook.com/privacy/policy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Política de Privacidad de Meta
                </a>
                .
              </p>

              <h2>6. Compartición de datos</h2>
              <p>
                Tus datos podrán ser compartidos con Mundo Pacífico S.A. y sus filiales únicamente para
                la gestión de la solicitud y la eventual contratación del servicio. No vendemos ni
                transferimos tus datos a terceros ajenos a este proceso.
              </p>

              <h2>7. Seguridad de la información</h2>
              <p>
                Implementamos medidas técnicas y organizativas para proteger tus datos contra accesos
                no autorizados, pérdida, alteración o destrucción. Entre ellas: autenticación segura,
                rate limiting, sanitización de inputs y almacenamiento en servicios cloud con altos
                estándares de seguridad.
              </p>

              <h2>8. Tus derechos</h2>
              <p>Como titular de tus datos personales, tenés derecho a:</p>
              <ul>
                <li>Acceder a tus datos personales.</li>
                <li>Rectificar datos inexactos o incompletos.</li>
                <li>Solicitar la eliminación de tus datos.</li>
                <li>Oponerte al tratamiento de tus datos para fines comerciales.</li>
                <li>Revocar tu consentimiento en cualquier momento.</li>
              </ul>
              <p>
                Para ejercer estos derechos, escribinos por WhatsApp o correo electrónico indicando tu
                nombre, teléfono y el derecho que querés ejercer.
              </p>

              <h2>9. Conservación de los datos</h2>
              <p>
                Conservamos tus datos personales mientras sean necesarios para cumplir con las
                finalidades descritas o mientras exista una relación comercial vigente. Una vez
                finalizada, los datos se eliminarán o anonimizarán conforme a la normativa aplicable.
              </p>

              <h2>10. Modificaciones</h2>
              <p>
                Nos reservamos el derecho de actualizar esta política en cualquier momento. Cualquier
                cambio importante será comunicado a través de este sitio web.
              </p>

              <h2>11. Contacto</h2>
              <p>
                Si tenés dudas sobre esta Política de Privacidad o sobre el tratamiento de tus datos,
                contactanos a través de los medios publicados en la sección de contacto de este sitio.
              </p>
            </div>

            <div className="privacy-footer">
              <Link href="/" className="btn btn-primary">
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
            <p>&copy; 2026 Mundo Telecomunicaciones. Página web de Ejecutivo/a de Ventas Oficial Independiente.</p>
            <p style={{ marginTop: "0.5rem", fontSize: "0.75rem" }}>
              Los logotipos, marcas comerciales y nombres de servicios exhibidos en este sitio son
              propiedad exclusiva de Mundo Pacífico S.A. y sus filiales. Este sitio tiene propósitos
              informativos y de captación comercial por parte de una ejecutiva oficial independiente.
            </p>
            <p style={{ marginTop: "0.75rem" }}>
              <Link href="/politica-de-privacidad" className="text-[#00748E] hover:text-[#005A6F] hover:underline font-medium">
                Política de Privacidad y Cookies
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
