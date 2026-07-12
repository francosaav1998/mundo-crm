"use client";

import { useRef, useEffect } from "react";

export default function Hero({
  bgVideoUrl,
  onScrollTo,
  onSelectPlan,
  onOpenModal,
  company = null,
  featuredPlan = null,
  content = {},
}) {
  const videoRef = useRef(null);
  const companyName = company?.name || "Mundo";
  const c = content || {};

  const videoType = bgVideoUrl
    ? bgVideoUrl.match(/\.(webm)$/i)
      ? "video/webm"
      : bgVideoUrl.match(/\.(mov)$/i)
      ? "video/quicktime"
      : "video/mp4"
    : "video/mp4";

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const start = () => {
      v.muted = true;
      v.play().catch(() => {
        v.muted = true;
        v.play().catch(() => {});
      });
    };
    start();
    document.addEventListener("touchstart", start, { once: true });
    document.addEventListener("click", start, { once: true });
    window.addEventListener("scroll", () => { if (!v.paused) return; start(); }, { once: true, passive: true });
    return () => {
      document.removeEventListener("touchstart", start);
      document.removeEventListener("click", start);
    };
  }, [bgVideoUrl]);

  return (
    <section id="inicio" className="hero">
      {bgVideoUrl && (
        <div className="hero-video-bg" aria-hidden="true">
          <video
            ref={videoRef}
            className="hero-video-bg__el"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onCanPlay={(e) => { e.target.play().catch(() => {}); }}
            onLoadedMetadata={(e) => { const v = e.target; v.muted = true; v.play().catch(() => {}); }}
          >
            <source src={bgVideoUrl} type={videoType} />
          </video>
          <div className="hero-video-bg__overlay" />
        </div>
      )}
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
