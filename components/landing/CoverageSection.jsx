"use client";

const DEFAULT_OPTIONS = [
  "Necesito Asesoría / Otro",
];

export default function CoverageSection({
  formData,
  setFormData,
  formStatus,
  submitting,
  onSubmit,
  sellerLabels = {},
  plans = [],
  content = {},
}) {
  const c = content || {};
  const steps = Array.isArray(c.steps) && c.steps.length > 0 ? c.steps : [
    { title: "Ingresa tus datos", description: "Escribe tu nombre, comuna y dirección completa." },
    { title: "Selecciona tu plan", description: "Indícanos cuál es el plan de tu interés o si buscas asesoría." },
    { title: "¡Listo para contactar!", description: "Presiona enviar y recibe una respuesta personalizada de tu ejecutivo/a." },
  ];

  const planOptions = plans.length > 0
    ? [...plans.map((p) => p.value), ...DEFAULT_OPTIONS]
    : DEFAULT_OPTIONS;

  const titleHighlight = c.titleHighlight || "¡Compruébalo Gratis!";
  const description = (c.description || "Completa el siguiente formulario con tus datos de ubicación. Evaluaremos inmediatamente la cobertura de fibra óptica en tu zona y tu {executive} te contactará con las ofertas disponibles.").replace(
    /{executive}/g,
    sellerLabels.executive || "ejecutivo/a"
  );

  return (
    <section id="cobertura" className="coverage-section">
      <div className="container">
        <div className="coverage-layout">
          <div className="coverage-info">
            <h2>
              {c.title || "¿Tienes Cobertura en tu Sector?"} <span>{titleHighlight}</span>
            </h2>
            <p>{description}</p>
            <div className="coverage-steps">
              {steps.map((step, idx) => (
                <div className="step-card" key={idx}>
                  <div className="step-num">{idx + 1}</div>
                  <div className="step-text">
                    <h4>{step.title}</h4>
                    <p>{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="coverage-card">
            <h3>{c.formTitle || "Consultar Factibilidad Técnica"}</h3>
            {formStatus.message && (
              <div className={`form-message ${formStatus.type}`}>{formStatus.message}</div>
            )}
            <form id="coverage-form" onSubmit={onSubmit}>
              <div className="form-group">
                <label htmlFor="client-name">Nombre y Apellido *</label>
                <input
                  type="text"
                  id="client-name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej. Juan Pérez"
                />
              </div>
              <div className="form-group">
                <label htmlFor="client-phone">Número de Contacto *</label>
                <input
                  type="tel"
                  id="client-phone"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Ej. +569 1234 5678"
                />
              </div>
              <div className="form-group">
                <label htmlFor="client-email">Correo Electrónico</label>
                <input
                  type="email"
                  id="client-email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Ej. juan@correo.cl"
                />
              </div>
              <div className="form-group">
                <label htmlFor="client-city">Comuna / Ciudad *</label>
                <input
                  type="text"
                  id="client-city"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Ej. Concepción, Temuco, etc."
                />
              </div>
              <div className="form-group">
                <label htmlFor="client-address">Dirección y Numeración *</label>
                <input
                  type="text"
                  id="client-address"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Ej. Av. Central 1234, Depto 40"
                />
              </div>
              <div className="form-group">
                <label htmlFor="client-plan">Plan de Interés</label>
                <select
                  id="client-plan"
                  value={formData.plan || ""}
                  onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                >
                  {planOptions.map((option) => (
                    <option key={option} value={option}>
                      {option.replace(")", "/mes)")}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
                <i className="bi bi-send-fill"></i>{" "}
                {submitting ? "Enviando..." : (c.submitLabel || "Enviar solicitud")}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
