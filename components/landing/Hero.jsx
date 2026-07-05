"use client";

import { useRef } from "react";

export default function Hero({ bgVideoUrl, onScrollTo, onSelectPlan }) {
  const videoRef = useRef(null);

  const videoType = bgVideoUrl
    ? bgVideoUrl.match(/\.(webm)$/i)
      ? "video/webm"
      : bgVideoUrl.match(/\.(mov)$/i)
      ? "video/quicktime"
      : "video/mp4"
    : "video/mp4";

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
        <div className="hero-content scroll-animate fade-in-left">
          <span className="badge-promo">
            <i className="bi bi-lightning-charge-fill"></i> Promociones de Invierno
          </span>
          <h1>
            Conéctate con la Fibra <span>más rápida de Chile</span>
          </h1>
          <p>
            Contrata hoy con asesoría personalizada directa a tu WhatsApp. Disfruta de la
            mejor relación precio-calidad, instalación express y soporte dedicado sin salir
            de casa.
          </p>
          <div className="hero-ctas">
            <button onClick={() => onScrollTo("planes")} className="btn btn-secondary">
              Ver Planes
            </button>
            <button
              onClick={() => onScrollTo("cobertura")}
              className="btn btn-outline"
              style={{ borderColor: "#fff", color: "#fff" }}
            >
              Evaluar Cobertura
            </button>
          </div>
        </div>

        <div className="hero-image-container scroll-animate fade-in-right">
          <div className="hero-card">
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
      </div>
    </section>
  );
}
