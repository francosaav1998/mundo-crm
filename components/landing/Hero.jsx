"use client";

export default function Hero({
  onScrollTo,
  onSelectPlan,
  onOpenModal,
  company = null,
  featuredPlan = null,
  content = {},
}) {
  const companyName = company?.name || "Mundo";
  const c = content || {};

  return (
    <section id="inicio" className="hero">
      <div className="container">
        <div className="hero-content">
          <span className="badge-promo">
            <i className="bi bi-lightning-charge-fill"></i> {c.badge || "Promociones de Invierno"}
          </span>
          <h1>
            {c.title || "Conéctate con la Fibra"} <span>{c.titleHighlight || "más rápida de Chile"}</span>
          </h1>
          <p>
            {c.description ||
              "Contrata hoy con asesoría personalizada. Disfruta de la mejor relación precio-calidad, instalación express y soporte dedicado sin salir de casa."}
          </p>
          <div className="hero-ctas">
            <button onClick={() => onScrollTo("planes")} className="btn btn-secondary">
              {c.ctaPrimary || "Ver Planes"}
            </button>
            <button
              onClick={onOpenModal}
              className="btn btn-outline"
              style={{ borderColor: "#fff", color: "#fff" }}
            >
              {c.ctaSecondary || "Evaluar Cobertura"}
            </button>
          </div>
        </div>

        <div className="hero-image-container">
          <div className="hero-card">
            <span className="badge-promo">{c.cardBadge || "¡El más vendido!"}</span>
            <div className="hero-card-title">{companyName.toUpperCase()} {c.cardTitleSuffix || "FIBRA"}</div>
            <div className="hero-card-subtitle">
              {featuredPlan
                ? `${featuredPlan.speed} ${featuredPlan.speedLabel || "Megas Simétricos"}`
                : c.cardFallbackSubtitle || "Fibra Óptica de Alta Velocidad"}
            </div>
            <div className="hero-card-price">
              {featuredPlan ? featuredPlan.price : c.cardFallbackPrice || "Desde $12.990"} <span>/ mes</span>
            </div>
            <div className="hero-card-price-sub">
              {featuredPlan ? featuredPlan.priceSubtitle : c.cardFallbackPriceSubtitle || "Sujeto a factibilidad técnica."}
            </div>
            <ul className="hero-card-features">
              {(featuredPlan?.features || []).slice(0, 4).map((feature, idx) => (
                <li key={idx}>
                  <i className={feature.unavailable ? "bi bi-x-circle-fill" : "bi bi-check-circle-fill"}></i> {feature.text}
                </li>
              ))}
              {!featuredPlan && (
                <>
                  <li><i className="bi bi-check-circle-fill"></i> Velocidad simétrica de alta capacidad</li>
                  <li><i className="bi bi-check-circle-fill"></i> Router Wi-Fi de última generación</li>
                  <li><i className="bi bi-check-circle-fill"></i> Instalación fibra óptica directa al hogar</li>
                  <li><i className="bi bi-check-circle-fill"></i> Soporte técnico prioritario</li>
                </>
              )}
            </ul>
            <button
              onClick={() => onSelectPlan(featuredPlan ? featuredPlan.value : "")}
              className="btn btn-primary plan-cta w-100"
            >
              <i className="bi bi-send-fill"></i> Solicitar este plan
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
