"use client";

const PLAN_OPTIONS = [
  "Plan Fibra 800 Megas ($12.990)",
  "Plan Hiper Fibra 1 Giga ($15.990)",
  "Plan Dúo 800 Megas + TV ($23.990)",
  "Plan Dúo 1 Giga + TV ($26.990)",
  "Plan Móvil Gigas Libres ($5.990)",
  "Necesito Asesoría / Otro",
];

export default function CoverageSection({
  formData,
  setFormData,
  formStatus,
  submitting,
  onSubmit,
  sellerLabels = {},
}) {
  return (
    <section id="cobertura" className="coverage-section">
      <div className="container">
        <div className="coverage-layout">
          <div className="coverage-info scroll-animate fade-in-left">
            <h2>
              ¿Tienes Cobertura en tu Sector? <span>¡Compruébalo Gratis!</span>
            </h2>
            <p>
              Completa el siguiente formulario con tus datos de ubicación. Evaluaremos
              inmediatamente la cobertura de fibra óptica en tu zona y tu {sellerLabels.executive || "ejecutivo/a"} te contactará con las ofertas disponibles.
            </p>
            <div className="coverage-steps">
              <div className="step-card">
                <div className="step-num">1</div>
                <div className="step-text">
                  <h4>Ingresa tus datos</h4>
                  <p>Escribe tu nombre, comuna y dirección completa.</p>
                </div>
              </div>
              <div className="step-card">
                <div className="step-num">2</div>
                <div className="step-text">
                  <h4>Selecciona tu plan</h4>
                  <p>Indícanos cuál es el plan de tu interés o si buscas asesoría.</p>
                </div>
              </div>
              <div className="step-card">
                <div className="step-num">3</div>
                <div className="step-text">
                  <h4>¡Listo para contactar!</h4>
                  <p>Presiona enviar y recibe una respuesta personalizada de tu {sellerLabels.executive || "ejecutivo/a"}.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="coverage-card scroll-animate fade-in-right">
            <h3>Consultar Factibilidad Técnica</h3>
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
                  value={formData.plan}
                  onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                >
                  {PLAN_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option.replace(")", "/mes)")}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
                <i className="bi bi-send-fill"></i>{" "}
                {submitting ? "Enviando..." : "Enviar solicitud"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
