"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { getCompanyVars } from "@/lib/company";
import { getSellerLabels, updateSellerConfig } from "@/lib/seller";
import CompanyFonts from "@/components/landing/CompanyFonts";
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import SellerSection from "@/components/landing/SellerSection";
import PlansSection from "@/components/landing/PlansSection";
import CoverageSection from "@/components/landing/CoverageSection";
import BenefitsSection from "@/components/landing/BenefitsSection";
import BenefitsSlider from "@/components/landing/BenefitsSlider";
import Footer from "@/components/landing/Footer";

export const PREVIEW_SECTIONS = [
  { id: "header", label: "Header" },
  { id: "hero", label: "Hero" },
  { id: "seller", label: "Vendedor" },
  { id: "benefitsSlider", label: "Diapositivas" },
  { id: "plans", label: "Planes" },
  { id: "coverage", label: "Cobertura" },
  { id: "benefits", label: "Beneficios" },
  { id: "footer", label: "Footer" },
];

const DESKTOP_WIDTH = 1280;
const MOBILE_WIDTH = 390;
const EDITOR_OUTLINE = "#2563EB";

export default function LandingPreview({
  content,
  plans,
  profile,
  company,
  activeSection,
  onSelectSection,
  viewport = "desktop",
  T,
}) {
  const frameRef = useRef(null);
  const scrollRef = useRef(null);
  const contentRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [frameHeight, setFrameHeight] = useState(0);
  const [hoveredSection, setHoveredSection] = useState(null);

  const virtualWidth = viewport === "mobile" ? MOBILE_WIDTH : DESKTOP_WIDTH;

  // Keep the global SELLER_CONFIG in sync with the editing profile so
  // SellerSection and Footer render the live name and default message.
  useEffect(() => {
    updateSellerConfig({
      name: profile?.name || "",
      phone: profile?.phone || "",
      defaultMessage: profile?.defaultMessage || undefined,
    });
  }, [profile?.name, profile?.phone, profile?.defaultMessage]);

  // Recompute scale when the viewport changes or the container resizes.
  useEffect(() => {
    const updateScale = () => {
      const container = frameRef.current;
      if (!container) return;
      const width = container.clientWidth;
      const nextScale = Math.min(1, width / virtualWidth);
      setScale(nextScale);
    };
    updateScale();

    const observer = new ResizeObserver(() => {
      // Wrap in requestAnimationFrame to avoid ResizeObserver loop warnings.
      window.requestAnimationFrame(updateScale);
    });
    if (frameRef.current) observer.observe(frameRef.current);
    return () => observer.disconnect();
  }, [virtualWidth]);

  // Recompute canvas height whenever the rendered content changes.
  useEffect(() => {
    const updateHeight = () => {
      const el = contentRef.current;
      if (!el) return;
      setFrameHeight(el.offsetHeight * scale);
    };
    // Give React a frame to render the new content before measuring.
    const id = window.requestAnimationFrame(() => {
      updateHeight();
      // Second pass after fonts/images settle.
      setTimeout(updateHeight, 150);
    });
    return () => cancelAnimationFrame(id);
  }, [content, plans, profile, company, viewport, scale, activeSection]);

  // Scroll the active section into view when it is selected from the sidebar.
  useEffect(() => {
    if (!activeSection || !scrollRef.current || !contentRef.current) return;
    const el = contentRef.current.querySelector(`[data-preview-section="${activeSection}"]`);
    if (!el) return;
    const scrollBox = scrollRef.current;
    const top = Math.max(0, el.offsetTop - 12);
    scrollBox.scrollTo({ top, behavior: "smooth" });
  }, [activeSection]);

  const sellerLabels = useMemo(() => getSellerLabels(profile?.gender || ""), [profile?.gender]);
  const activePlans = useMemo(() => plans.filter((p) => p.sellerActive !== false), [plans]);
  const featuredPlan = useMemo(
    () => activePlans.find((p) => p.featured) || activePlans[0] || null,
    [activePlans]
  );

  const companyVars = useMemo(() => getCompanyVars(company), [company]);

  const formData = {
    name: "Ejemplo de cliente",
    phone: "+56 9 1234 5678",
    email: "",
    city: "Santiago",
    address: "Av. Siempre Viva 123",
    plan: activePlans[0]?.value || "",
  };

  const noop = useCallback(() => {}, []);
  const scrollToSection = useCallback((id) => {
    if (!scrollRef.current || !contentRef.current) return;
    const el = contentRef.current.querySelector(`[data-preview-section="${id}"]`);
    if (!el) return;
    const scrollBox = scrollRef.current;
    const top = Math.max(0, el.offsetTop - 12);
    scrollBox.scrollTo({ top, behavior: "smooth" });
  }, []);

  const handleSectionClick = useCallback(
    (e, id) => {
      e.preventDefault();
      e.stopPropagation();
      onSelectSection(id);
    },
    [onSelectSection]
  );

  return (
    <div
      ref={frameRef}
      style={{
        flex: 1,
        minWidth: 0,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "rgba(0,0,0,0.22)",
        borderRadius: 20,
        border: `1px solid ${T.border}`,
        overflow: "hidden",
        boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
      }}
    >
      <div
        style={{
          padding: "10px 14px",
          background: T.bgCard,
          borderBottom: `1px solid ${T.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <i className="bi bi-aspect-ratio" style={{ color: T.muted, fontSize: 14 }}></i>
          <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>
            {viewport === "mobile" ? "Vista móvil" : "Vista escritorio"}
          </span>
          <span style={{ fontSize: 11, color: T.muted }}>
            {Math.round(scale * 100)}%
          </span>
        </div>
        <span style={{ fontSize: 11, color: T.muted }}>
          Click en una sección para editarla
        </span>
      </div>

      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            width: virtualWidth * scale,
            height: frameHeight,
            flexShrink: 0,
            transition: "width 0.2s, height 0.2s",
          }}
        >
          <div
            style={{
              width: virtualWidth,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              background: "#fff",
            }}
          >
            <div
              ref={contentRef}
              data-landing-theme={profile?.landingTheme || "light"}
              data-company={company?.slug || "mundo"}
              style={{
                ...companyVars,
                fontFamily: "var(--company-font-family)",
              }}
            >
              <CompanyFonts company={company} />

              <SectionFrame
                id="header"
                label="Header"
                active={activeSection === "header"}
                hovered={hoveredSection === "header"}
                onHover={setHoveredSection}
                onClick={handleSectionClick}
              >
                <Header
                  menuOpen={false}
                  setMenuOpen={noop}
                  onScrollTo={scrollToSection}
                  sellerLabels={sellerLabels}
                  company={company}
                  content={content.header}
                />
              </SectionFrame>

              <SectionFrame
                id="hero"
                label="Hero"
                active={activeSection === "hero"}
                hovered={hoveredSection === "hero"}
                onHover={setHoveredSection}
                onClick={handleSectionClick}
              >
                <Hero
                  onScrollTo={scrollToSection}
                  onSelectPlan={noop}
                  onOpenModal={noop}
                  company={company}
                  featuredPlan={featuredPlan}
                  content={content.hero}
                />
              </SectionFrame>

              <SectionFrame
                id="seller"
                label="Vendedor"
                active={activeSection === "seller"}
                hovered={hoveredSection === "seller"}
                onHover={setHoveredSection}
                onClick={handleSectionClick}
              >
                <SellerSection
                  sellerPhotoUrl={profile?.photo || ""}
                  sellerBioText={profile?.bio || ""}
                  sellerLabels={sellerLabels}
                  onScrollTo={scrollToSection}
                  company={company}
                  content={content.seller}
                />
              </SectionFrame>

              <SectionFrame
                id="benefitsSlider"
                label="Diapositivas"
                active={activeSection === "benefitsSlider"}
                hovered={hoveredSection === "benefitsSlider"}
                onHover={setHoveredSection}
                onClick={handleSectionClick}
              >
                <BenefitsSlider content={content.benefitsSlider} />
              </SectionFrame>

              <SectionFrame
                id="plans"
                label="Planes"
                active={activeSection === "plans"}
                hovered={hoveredSection === "plans"}
                onHover={setHoveredSection}
                onClick={handleSectionClick}
              >
                <PlansSection
                  plans={activePlans}
                  onSelectPlan={noop}
                  company={company}
                  content={content.plans}
                />
              </SectionFrame>

              <SectionFrame
                id="coverage"
                label="Cobertura"
                active={activeSection === "coverage"}
                hovered={hoveredSection === "coverage"}
                onHover={setHoveredSection}
                onClick={handleSectionClick}
              >
                <CoverageSection
                  formData={formData}
                  setFormData={setFormData}
                  formStatus={{ type: "", message: "" }}
                  submitting={false}
                  onSubmit={(e) => e.preventDefault()}
                  sellerLabels={sellerLabels}
                  plans={activePlans}
                  content={content.coverage}
                />
              </SectionFrame>

              <SectionFrame
                id="benefits"
                label="Beneficios"
                active={activeSection === "benefits"}
                hovered={hoveredSection === "benefits"}
                onHover={setHoveredSection}
                onClick={handleSectionClick}
              >
                <BenefitsSection companyName={company?.name || "Mundo"} content={content.benefits} />
              </SectionFrame>

              <SectionFrame
                id="footer"
                label="Footer"
                active={activeSection === "footer"}
                hovered={hoveredSection === "footer"}
                onHover={setHoveredSection}
                onClick={handleSectionClick}
              >
                <Footer
                  footerText={profile?.footerText || ""}
                  onScrollTo={scrollToSection}
                  sellerLabels={sellerLabels}
                  sellerPhone={profile?.phone || ""}
                  company={company}
                  content={content.footer}
                />
              </SectionFrame>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionFrame({ id, label, active, hovered, onHover, onClick, children }) {
  const showOutline = active || hovered;
  return (
    <div
      data-preview-section={id}
      style={{ position: "relative" }}
      onMouseEnter={() => onHover(id)}
      onMouseLeave={() => onHover((prev) => (prev === id ? null : prev))}
    >
      <div style={{ pointerEvents: "none" }}>{children}</div>
      <div
        onClick={(e) => onClick(e, id)}
        style={{
          position: "absolute",
          inset: 0,
          cursor: "pointer",
          zIndex: 10,
          boxShadow: showOutline
            ? active
              ? `inset 0 0 0 3px ${EDITOR_OUTLINE}, 0 0 0 1px rgba(37,99,235,0.35)`
              : `inset 0 0 0 2px ${EDITOR_OUTLINE}`
            : "none",
          background: showOutline ? "rgba(37,99,235,0.04)" : "transparent",
          transition: "all 0.15s ease",
        }}
      />
      {showOutline && (
        <div
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            zIndex: 11,
            background: EDITOR_OUTLINE,
            color: "#fff",
            fontSize: 11,
            fontWeight: 800,
            padding: "4px 10px",
            borderRadius: 6,
            boxShadow: "0 4px 12px rgba(37,99,235,0.35)",
            pointerEvents: "none",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}
