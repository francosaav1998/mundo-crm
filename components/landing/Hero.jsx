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
      <div className="container hero-container">
        <div className="hero-content scroll-animate fade-in-left">
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
          <div className="hero-content__inner">
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
        </div>
      </div>
    </section>
  );
}
