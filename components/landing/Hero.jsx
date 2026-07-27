"use client";

import { useEffect, useState } from "react";
import EditableText from "./EditableText";

export default function Hero({
  onScrollTo,
  onSelectPlan,
  onOpenModal,
  company = null,
  featuredPlan = null,
  plans = [],
  content = {},
}) {
  const companyName = company?.name || "Mundo";
  const c = content || {};
  const backgroundImageUrl = String(c.backgroundImageUrl || "").trim();
  const backgroundImages = Array.isArray(c.backgroundImages)
    ? c.backgroundImages.filter((url) => typeof url === "string" && url.trim() !== "")
    : [];
  const allBackgroundImages = backgroundImageUrl
    ? [backgroundImageUrl, ...backgroundImages]
    : backgroundImages;

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (allBackgroundImages.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % allBackgroundImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [allBackgroundImages.length]);

  return (
    <section id="inicio" className="hero">
      {allBackgroundImages.length > 0 && (
        <div className="hero-backgrounds" aria-hidden="true">
          {allBackgroundImages.map((url, idx) => (
            <div
              key={url + idx}
              className={`hero-background-slide ${idx === activeIndex ? "active" : ""}`}
              style={{
                backgroundImage: `linear-gradient(135deg, rgba(15, 23, 42, 0.82) 0%, rgba(15, 23, 42, 0.55) 100%), url("${url}")`,
              }}
            />
          ))}
        </div>
      )}
      <div className="container">
        <div className="hero-content">
          <span className="badge-promo">
            <i className="bi bi-lightning-charge-fill"></i>{" "}
            <EditableText path="hero.badge">{c.badge || "Promociones de Invierno"}</EditableText>
          </span>
          <h1>
            <EditableText path="hero.title">{c.title || "Conéctate con la Fibra"}</EditableText>{" "}
            <EditableText path="hero.titleHighlight" tag="span">{c.titleHighlight || "más rápida de Chile"}</EditableText>
          </h1>
          <p>
            <EditableText path="hero.description" multiline>
              {c.description ||
                "Contrata hoy con asesoría personalizada. Disfruta de la mejor relación precio-calidad, instalación express y soporte dedicado sin salir de casa."}
            </EditableText>
          </p>
          <div className="hero-ctas">
            <button onClick={() => onScrollTo("planes")} className="btn btn-secondary">
              <EditableText path="hero.ctaPrimary">{c.ctaPrimary || "Ver Planes"}</EditableText>
            </button>
            <button
              onClick={onOpenModal}
              className="btn btn-outline"
              style={{ borderColor: "#fff", color: "#fff" }}
            >
              <EditableText path="hero.ctaSecondary">{c.ctaSecondary || "Evaluar Cobertura"}</EditableText>
            </button>
          </div>
        </div>

        <div className="hero-image-container">
          <div className="hero-card">
            <span className="badge-promo">
              <EditableText path="hero.cardBadge">{c.cardBadge || "¡El más vendido!"}</EditableText>
            </span>
            <div className="hero-card-title">
              {companyName.toUpperCase()}{" "}
              <EditableText path="hero.cardTitleSuffix">{c.cardTitleSuffix || "FIBRA"}</EditableText>
            </div>
            <div className="hero-card-subtitle">
              {featuredPlan ? (
                <>
                  <EditableText path={`plan.${plans.indexOf(featuredPlan)}.speed`}>{featuredPlan.speed}</EditableText>{" "}
                  <EditableText path={`plan.${plans.indexOf(featuredPlan)}.speedLabel`}>{featuredPlan.speedLabel || "Megas Simétricos"}</EditableText>
                </>
              ) : (
                <EditableText path="hero.cardFallbackSubtitle">{c.cardFallbackSubtitle || "Fibra Óptica de Alta Velocidad"}</EditableText>
              )}
            </div>
            <div className="hero-card-price">
              {featuredPlan ? (
                <EditableText path={`plan.${plans.indexOf(featuredPlan)}.price`}>{featuredPlan.price}</EditableText>
              ) : (
                <EditableText path="hero.cardFallbackPrice">{c.cardFallbackPrice || "Desde $12.990"}</EditableText>
              )}{" "}
              <span>/ mes</span>
            </div>
            <div className="hero-card-price-sub">
              {featuredPlan ? (
                <EditableText path={`plan.${plans.indexOf(featuredPlan)}.priceSubtitle`}>
                  {featuredPlan.priceSubtitle}
                </EditableText>
              ) : (
                <EditableText path="hero.cardFallbackPriceSubtitle">
                  {c.cardFallbackPriceSubtitle || "Sujeto a factibilidad técnica."}
                </EditableText>
              )}
            </div>
            <ul className="hero-card-features">
              {(featuredPlan?.features || []).slice(0, 4).map((feature, idx) => {
                const planIndex = plans.findIndex((p) => p.id === featuredPlan.id);
                return (
                  <li key={idx}>
                    <i className={feature.unavailable ? "bi bi-x-circle-fill" : "bi bi-check-circle-fill"}></i>{" "}
                    {planIndex >= 0 ? (
                      <EditableText path={`plan.${planIndex}.features.${idx}.text`}>{feature.text}</EditableText>
                    ) : (
                      feature.text
                    )}
                  </li>
                );
              })}
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
              <i className="bi bi-send-fill"></i>{" "}
              <EditableText path="hero.ctaPrimary">Solicitar este plan</EditableText>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
