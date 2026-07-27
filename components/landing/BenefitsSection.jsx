"use client";

import EditableText from "./EditableText";

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
  const backgroundImageUrl = String(c.backgroundImageUrl || "").trim();
  const sectionStyle = backgroundImageUrl
    ? {
        backgroundImage: `linear-gradient(135deg, rgba(10, 14, 26, 0.86) 0%, rgba(10, 14, 26, 0.68) 100%), url("${backgroundImageUrl}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }
    : undefined;

  return (
    <section
      id="beneficios"
      className={`benefits-section${backgroundImageUrl ? " benefits-section--photo" : ""}`}
      style={sectionStyle}
    >
      <div className="container">
        <div className="section-header">
          <h2>
            <EditableText path="benefits.header.title">{c.title || "¿Por qué contratar"}</EditableText>{" "}
            <span>{companyName}</span>
            <EditableText path="benefits.header.titleSuffix">{c.titleSuffix || "?"}</EditableText>
          </h2>
          <p>
            <EditableText path="benefits.header.description" multiline>
              {c.description || "Únete a la red que está revolucionando la conectividad en el país."}
            </EditableText>
          </p>
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
              <h3>
                <EditableText path={`benefits.items.${index}.title`}>{benefit.title}</EditableText>
              </h3>
              <p>
                <EditableText path={`benefits.items.${index}.description`} multiline>
                  {benefit.description}
                </EditableText>
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
