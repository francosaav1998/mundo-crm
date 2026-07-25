"use client";

import { useEffect, useMemo, useRef } from "react";
import { getCompanyVars } from "@/lib/company";
import { getSellerLabels } from "@/lib/seller";
import CompanyFonts from "@/components/landing/CompanyFonts";
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import SellerSection from "@/components/landing/SellerSection";
import PlansSection from "@/components/landing/PlansSection";
import CoverageSection from "@/components/landing/CoverageSection";
import BenefitsSection from "@/components/landing/BenefitsSection";
import Footer from "@/components/landing/Footer";

const SECTION_LABELS = {
  header: "Header",
  hero: "Hero",
  seller: "Vendedor",
  plans: "Planes",
  coverage: "Cobertura",
  benefits: "Beneficios",
  footer: "Footer",
};

const noop = () => {};
const PREVIEW_FORM_DATA = { name: "", phone: "", email: "", city: "", address: "", plan: "" };
const PREVIEW_FORM_STATUS = { type: "", message: "" };

function PreviewSection({ id, active, onSelect, innerRef, children }) {
  return (
    <div
      ref={innerRef}
      className={`le-section${active ? " le-section--active" : ""}`}
      onClick={() => onSelect(id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(id);
        }
      }}
    >
      <div className="le-section__content">{children}</div>
      <div className="le-section__overlay" aria-hidden="true">
        <span className="le-section__chip">{SECTION_LABELS[id] || id}</span>
      </div>
    </div>
  );
}

export default function LandingPreview({
  content,
  plans,
  sellerData,
  activeSection,
  onSelectSection,
  scrollTarget,
}) {
  const canvasRef = useRef(null);
  const sectionRefs = useRef({});

  const company = sellerData?.company || null;
  const companyVars = useMemo(() => getCompanyVars(company), [company]);
  const sellerLabels = getSellerLabels(sellerData?.gender || "");

  const activePlans = useMemo(
    () => (Array.isArray(plans) ? plans.filter((p) => p.sellerActive !== false) : []),
    [plans]
  );
  const featuredPlan = activePlans.find((p) => p.featured) || activePlans[0] || null;

  // Scroll del canvas cuando se selecciona una sección desde el panel lateral
  useEffect(() => {
    if (!scrollTarget?.id) return;
    const el = sectionRefs.current[scrollTarget.id];
    const canvas = canvasRef.current;
    if (!el || !canvas) return;
    const top = el.getBoundingClientRect().top - canvas.getBoundingClientRect().top + canvas.scrollTop - 12;
    canvas.scrollTo({ top, behavior: "smooth" });
  }, [scrollTarget]);

  const setSectionRef = (id) => (el) => {
    if (el) sectionRefs.current[id] = el;
  };

  const sectionProps = (id) => ({
    id,
    active: activeSection === id,
    onSelect: onSelectSection,
    innerRef: setSectionRef(id),
  });

  return (
    <div ref={canvasRef} className="le-canvas-scroll">
      <div className="le-canvas-frame">
        <div
          className="landing-preview-inner"
          data-company={company?.slug || "mundo"}
          data-landing-theme={sellerData?.landingTheme || "light"}
          style={companyVars}
        >
          <CompanyFonts company={company} />

          <PreviewSection {...sectionProps("header")}>
            <Header
              menuOpen={false}
              setMenuOpen={noop}
              onScrollTo={noop}
              sellerLabels={sellerLabels}
              company={company}
              content={content.header}
            />
          </PreviewSection>

          <main>
            <PreviewSection {...sectionProps("hero")}>
              <Hero
                onScrollTo={noop}
                onSelectPlan={noop}
                onOpenModal={noop}
                company={company}
                featuredPlan={featuredPlan}
                content={content.hero}
              />
            </PreviewSection>

            <PreviewSection {...sectionProps("seller")}>
              <SellerSection
                sellerPhotoUrl={sellerData?.photo || ""}
                sellerBioText={sellerData?.bio || ""}
                sellerLabels={sellerLabels}
                onScrollTo={noop}
                company={company}
                content={content.seller}
              />
            </PreviewSection>

            <PreviewSection {...sectionProps("plans")}>
              <PlansSection
                plans={activePlans}
                onSelectPlan={noop}
                company={company}
                content={content.plans}
              />
            </PreviewSection>

            <PreviewSection {...sectionProps("coverage")}>
              <CoverageSection
                formData={PREVIEW_FORM_DATA}
                setFormData={noop}
                formStatus={PREVIEW_FORM_STATUS}
                submitting={false}
                onSubmit={noop}
                sellerLabels={sellerLabels}
                plans={activePlans}
                content={content.coverage}
              />
            </PreviewSection>

            <PreviewSection {...sectionProps("benefits")}>
              <BenefitsSection
                companyName={company?.name || "Mundo"}
                content={content.benefits}
              />
            </PreviewSection>
          </main>

          <PreviewSection {...sectionProps("footer")}>
            <Footer
              footerText={sellerData?.footerText || ""}
              onScrollTo={noop}
              sellerLabels={sellerLabels}
              sellerPhone={sellerData?.phone || ""}
              company={company}
              content={content.footer}
            />
          </PreviewSection>
        </div>
      </div>
    </div>
  );
}
