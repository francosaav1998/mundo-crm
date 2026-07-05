"use client";

export default function HeroCard({ onSelectPlan }) {
  return (
    <section className="hero-card-row">
      <div className="container">
        <div className="hero-card scroll-animate fade-in-right">
          <span className="badge-promo">¡El más vendido!</span>
          <div className="hero-card-title">MUNDO FIBRA</div>
          <div className="hero-card-subtitle">800 Megas Simétricos</div>
          <div className="hero-card-price">
            $12.990 <span>/ mes</span>
          </div>
          <div className="hero-card-price-sub">
            Precio fijo para siempre, sujeto a factibilidad técnica.
          </div>
          <ul className="hero-card-features">
            <li>
              <i className="bi bi-check-circle-fill"></i> 800 Mbps Súbida / 800 Mbps Bajada
            </li>
            <li>
              <i className="bi bi-check-circle-fill"></i> Router Wi-Fi de última generación
            </li>
            <li>
              <i className="bi bi-check-circle-fill"></i> Instalación fibra óptica directa al
              hogar
            </li>
            <li>
              <i className="bi bi-check-circle-fill"></i> Soporte técnico prioritario
            </li>
          </ul>
          <button
            onClick={() => onSelectPlan("Plan Fibra 800 Megas ($12.990)")}
            className="btn btn-primary btn-whatsapp plan-cta w-100"
          >
            <i className="bi bi-whatsapp"></i> Contratar por WhatsApp
          </button>
        </div>
      </div>
    </section>
  );
}