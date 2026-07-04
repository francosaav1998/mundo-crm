import Link from "next/link";

export const metadata = {
  title: "Política de Privacidad | Tu Asesora Mundo",
  description: "Conoce cómo protegemos tus datos personales y cómo usamos cookies y tecnologías de seguimiento en nuestro sitio.",
};

export default function PoliticaPrivacidadPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8 md:p-12">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#00748E] hover:text-[#005A6F] transition-colors"
          >
            <i className="bi bi-arrow-left"></i>
            Volver al inicio
          </Link>
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
          Política de Privacidad
        </h1>
        <p className="text-sm text-slate-500 mb-8">
          Última actualización: 04 de julio de 2026
        </p>

        <div className="prose prose-slate max-w-none">
          <p className="text-slate-700 leading-relaxed">
            En <strong>Tu Asesora Mundo</strong> nos tomamos muy en serio la protección de tus datos
            personales. Esta política explica qué información recopilamos, con qué fines la usamos
            y cuáles son tus derechos como usuario. Este sitio es operado por una ejecutiva de
            ventas autorizada e independiente de Mundo Pacífico S.A. con fines de captación
            comercial.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3">
            1. Responsable del tratamiento
          </h2>
          <p className="text-slate-700 leading-relaxed">
            El responsable del tratamiento de los datos es la ejecutiva comercial independiente que
            opera este sitio, actuando como intermediaria para la gestión de solicitudes de
            información y contratación de servicios de Mundo. Para ejercer tus derechos, podés
            contactarnos a través del formulario de contacto o por WhatsApp publicado en este sitio.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3">
            2. Datos personales que recopilamos
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-700 leading-relaxed">
            <li>Nombre completo</li>
            <li>Teléfono de contacto</li>
            <li>Correo electrónico (opcional)</li>
            <li>Comuna o ciudad de residencia</li>
            <li>Dirección de instalación</li>
            <li>Plan de servicio de interés</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3">
            3. Finalidad del tratamiento
          </h2>
          <p className="text-slate-700 leading-relaxed">
            Tus datos se utilizan exclusivamente para:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-700 leading-relaxed">
            <li>Gestionar tu solicitud de factibilidad técnica y cotización.</li>
            <li>Contactarte por teléfono, WhatsApp o correo electrónico para coordinar la instalación.</li>
            <li>Enviarte información comercial relacionada con planes y promociones de Mundo.</li>
            <li>Cumplir con obligaciones legales y regulatorias.</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3">
            4. Base legal
          </h2>
          <p className="text-slate-700 leading-relaxed">
            El tratamiento de tus datos se basa en tu consentimiento, otorgado al completar y
            enviar el formulario de contacto. Al hacerlo, declarás que los datos proporcionados son
            veraces y que tenés facultades para compartirlos.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3">
            5. Cookies y tecnologías de seguimiento
          </h2>
          <p className="text-slate-700 leading-relaxed">
            Este sitio utiliza cookies y tecnologías similares para mejorar tu experiencia y medir
            el rendimiento de nuestras campañas publicitarias. En particular, podemos utilizar el
            Meta Pixel de Facebook/Instagram para entender cómo los usuarios interactúan con el
            sitio después de ver nuestros anuncios. Estas herramientas pueden recopilar información
            anonimizada sobre tu navegación.
          </p>
          <p className="text-slate-700 leading-relaxed mt-4">
            Podés deshabilitar las cookies desde la configuración de tu navegador. Para más
            información sobre cómo Meta utiliza tus datos, visitá la{" "}
            <a
              href="https://www.facebook.com/privacy/policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00748E] hover:underline font-medium"
            >
              Política de Privacidad de Meta
            </a>
            .
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3">
            6. Compartición de datos
          </h2>
          <p className="text-slate-700 leading-relaxed">
            Tus datos podrán ser compartidos con Mundo Pacífico S.A. y sus filiales únicamente para
            la gestión de la solicitud y la eventual contratación del servicio. No vendemos ni
            transferimos tus datos a terceros ajenos a este proceso.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3">
            7. Seguridad de la información
          </h2>
          <p className="text-slate-700 leading-relaxed">
            Implementamos medidas técnicas y organizativas para proteger tus datos contra accesos
            no autorizados, pérdida, alteración o destrucción. Entre ellas: autenticación segura,
            rate limiting, sanitización de inputs y almacenamiento en servicios cloud con altos
            estándares de seguridad.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3">
            8. Tus derechos
          </h2>
          <p className="text-slate-700 leading-relaxed">
            Como titular de tus datos personales, tenés derecho a:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-700 leading-relaxed">
            <li>Acceder a tus datos personales.</li>
            <li>Rectificar datos inexactos o incompletos.</li>
            <li>Solicitar la eliminación de tus datos.</li>
            <li>Oponerte al tratamiento de tus datos para fines comerciales.</li>
            <li>Revocar tu consentimiento en cualquier momento.</li>
          </ul>
          <p className="text-slate-700 leading-relaxed mt-4">
            Para ejercer estos derechos, escribinos por WhatsApp o correo electrónico indicando tu
            nombre, teléfono y el derecho que querés ejercer.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3">
            9. Conservación de los datos
          </h2>
          <p className="text-slate-700 leading-relaxed">
            Conservamos tus datos personales mientras sean necesarios para cumplir con las
            finalidades descritas o mientras exista una relación comercial vigente. Una vez
            finalizada, los datos se eliminarán o anonimizarán conforme a la normativa aplicable.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3">
            10. Modificaciones
          </h2>
          <p className="text-slate-700 leading-relaxed">
            Nos reservamos el derecho de actualizar esta política en cualquier momento. Cualquier
            cambio importante será comunicado a través de este sitio web.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3">
            11. Contacto
          </h2>
          <p className="text-slate-700 leading-relaxed">
            Si tenés dudas sobre esta Política de Privacidad o sobre el tratamiento de tus datos,
            contactanos a través de los medios publicados en la sección de contacto de este sitio.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 text-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#00748E] text-white font-bold rounded-full hover:bg-[#005A6F] transition-colors"
          >
            <i className="bi bi-house-door-fill"></i>
            Volver a la página principal
          </Link>
        </div>
      </div>
    </main>
  );
}
