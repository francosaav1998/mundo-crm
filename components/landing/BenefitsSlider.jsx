"use client";

import EditableText from "./EditableText";

const DEFAULT_ITEMS = [
  { icon: "bi-wifi", title: "Fibra Óptica", description: "Hasta 940 Mbps simétricos" },
  { icon: "bi-arrow-down-up", title: "Subida y Bajada", description: "Velocidad simétrica real" },
  { icon: "bi-currency-dollar", title: "Precio Fijo", description: "Sin sorpresas en tu boleta" },
  { icon: "bi-tv", title: "TV Online", description: "95 canales HD + HBO Max" },
  { icon: "bi-shield-check", title: "Instalación", description: "Técnicos certificados" },
  { icon: "bi-headset", title: "Soporte", description: "Atención prioritaria" },
];

export default function BenefitsSlider({ content = {} }) {
  const c = content || {};
  const items = Array.isArray(c.items) && c.items.length > 0 ? c.items : DEFAULT_ITEMS;
  const loop = [...items, ...items];

  return (
    <section
      className="benefits-slider-section"
      aria-label="Beneficios destacados"
    >
      <div className="benefits-slider">
        <div className="benefits-track">
          {loop.map((item, idx) => (
            <div key={idx} className="benefit-slide">
              <div className="benefit-slide-icon">
                <i className={`bi ${item.icon || "bi-star-fill"}`}></i>
              </div>
              <h3 className="benefit-slide-title">
                <EditableText path={`benefitsSlider.items.${idx % items.length}.title`}>
                  {item.title}
                </EditableText>
              </h3>
              <p className="benefit-slide-desc">
                <EditableText path={`benefitsSlider.items.${idx % items.length}.description`}>
                  {item.description}
                </EditableText>
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
