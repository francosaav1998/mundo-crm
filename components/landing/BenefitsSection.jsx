"use client";

const BENEFITS = [
  {
    icon: "bi-speedometer",
    title: "La Red más Veloz",
    description:
      "Premiada consecutivamente como la red de fibra óptica más rápida de Latinoamérica por Ookla Speedtest.",
  },
  {
    icon: "bi-award-fill",
    title: "Velocidad Simétrica",
    description:
      "Misma velocidad de subida y bajada. Sube archivos, juega online y haz videollamadas sin interferencia.",
  },
  {
    icon: "bi-currency-dollar",
    title: "Precio Justo y Fijo",
    description:
      "Sin tarifas sorpresa ni cobros adicionales. El valor de tu plan se mantiene en el tiempo.",
  },
  {
    icon: "bi-shield-check",
    title: "Instalación Certificada",
    description:
      "Técnicos calificados que aseguran el correcto funcionamiento e instalación óptima en tu hogar.",
  },
];

export default function BenefitsSection({ companyName = "Mundo", content = {} }) {
  const c = content || {};
  const benefits = Array.isArray(c.items) && c.items.length > 0 ? c.items : BENEFITS;

  return (
    <section id="beneficios" className="benefits-section">
      <div className="container">
        <div className="section-header">
          <h2>
            {c.title || "¿Por qué contratar"} <span>{companyName}</span>{c.titleSuffix || "?"}
          </h2>
          <p>{c.description || "Únete a la red que está revolucionando la conectividad en el país."}</p>
        </div>
        <div className="benefits-grid">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.title}
              className="benefit-card"
            >
              <div className="benefit-icon">
                <i className={`bi ${benefit.icon}`}></i>
              </div>
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
