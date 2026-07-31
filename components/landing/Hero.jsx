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
  const configuredSlides = Array.isArray(c.slides) ? c.slides.filter(Boolean) : [];
  const slides = configuredSlides.length > 0 ? configuredSlides : [{ ...c }];

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  const activeSlideIndex = Math.min(activeIndex, slides.length - 1);
  const activeSlide = slides[activeSlideIndex] || slides[0];
  const activeBackground = allBackgroundImages[activeSlideIndex % Math.max(allBackgroundImages.length, 1)];
  const slideStyle = activeBackground
    ? { backgroundImage: `linear-gradient(135deg, rgba(15, 23, 42, 0.84) 0%, rgba(0, 116, 142, 0.62) 100%), url("${activeBackground}")` }
    : undefined;

  return (
    <section id="inicio" className={`hero hero-slide-${activeSlideIndex + 1}`} onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
      <div className="hero-backgrounds" aria-hidden="true">
        <div className="hero-background-slide active" style={slideStyle} />
      </div>
      <div className="container">
        <div className="hero-content">
          <span className="badge-promo">
            <i className={`bi ${activeSlide.icon || "bi-lightning-charge-fill"}`}></i>{" "}
            <EditableText path={`hero.slides.${activeIndex}.badge`}>{activeSlide.badge || c.badge || "Promociones de Invierno"}</EditableText>
          </span>
          <div key={activeSlideIndex} className="hero-slide-copy">
            <h1>
              <EditableText path={`hero.slides.${activeSlideIndex}.title`}>{activeSlide.title || c.title || "Conéctate con la Fibra"}</EditableText>{" "}
              <EditableText path={`hero.slides.${activeSlideIndex}.titleHighlight`} tag="span">{activeSlide.titleHighlight || c.titleHighlight || "más rápida de Chile"}</EditableText>
            </h1>
            <p>
              <EditableText path={`hero.slides.${activeSlideIndex}.description`} multiline>
                {activeSlide.description || c.description || "Contrata hoy con asesoría personalizada."}
              </EditableText>
            </p>
            <div className="hero-ctas">
              <button onClick={() => onScrollTo("planes")} className="btn btn-secondary">
                <EditableText path={`hero.slides.${activeSlideIndex}.ctaPrimary`}>{activeSlide.ctaPrimary || c.ctaPrimary || "Ver Planes"}</EditableText>
              </button>
              <button onClick={onOpenModal} className="btn btn-outline" style={{ borderColor: "#fff", color: "#fff" }}>
                <EditableText path={`hero.slides.${activeSlideIndex}.ctaSecondary`}>{activeSlide.ctaSecondary || c.ctaSecondary || "Evaluar Cobertura"}</EditableText>
              </button>
            </div>
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
      {slides.length > 1 && (
        <div className="hero-carousel-controls" aria-label="Selector de diapositiva">
          <button className="hero-carousel-arrow" onClick={() => setActiveIndex((activeIndex - 1 + slides.length) % slides.length)} aria-label="Diapositiva anterior">←</button>
          <div className="hero-carousel-dots">
            {slides.map((_, index) => (
              <button key={index} className={`hero-carousel-dot ${index === activeSlideIndex ? "active" : ""}`} onClick={() => setActiveIndex(index)} aria-label={`Ver diapositiva ${index + 1}`} aria-current={index === activeSlideIndex ? "true" : undefined} />
            ))}
          </div>
          <button className="hero-carousel-arrow" onClick={() => setActiveIndex((activeIndex + 1) % slides.length)} aria-label="Diapositiva siguiente">→</button>
        </div>
      )}
    </section>
  );
}
