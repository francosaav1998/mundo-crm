"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { updateSellerConfig, getSellerLabels, getWhatsAppUrl } from "@/lib/seller";
import { getCompanyVars } from "@/lib/company";
import { getLandingContent, getMergedPlans } from "@/lib/landing";
import MetaPixel from "@/components/landing/MetaPixel";
import CompanyFonts from "@/components/landing/CompanyFonts";
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import SellerSection from "@/components/landing/SellerSection";
import PlansSection from "@/components/landing/PlansSection";
import CoverageSection from "@/components/landing/CoverageSection";
import BenefitsSection from "@/components/landing/BenefitsSection";
import BenefitsSlider from "@/components/landing/BenefitsSlider";
import Footer from "@/components/landing/Footer";
import WhatsAppFloat from "@/components/landing/WhatsAppFloat";
import LeadModal from "@/components/landing/LeadModal";
import PreviewWrapper from "@/components/landing/PreviewWrapper";
import PreviewEditBootstrap from "@/components/landing/PreviewEditBootstrap";

export default function SellerLandingReact() {
  const params = useParams();
  const slug = params.slug;
  const searchParams = useSearchParams();
  const isPreview = searchParams.get("preview") === "1";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inactive, setInactive] = useState(false);
  const [seller, setSeller] = useState(null);
  const [company, setCompany] = useState(null);
  const [plans, setPlans] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    address: "",
    plan: "",
  });
  const [formStatus, setFormStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPlan, setModalPlan] = useState("");
  const [previewState, setPreviewState] = useState(null);
  const [previewActiveSection, setPreviewActiveSection] = useState(null);

  useEffect(() => {
    if (!isPreview || typeof window === "undefined") return;

    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.source !== window.parent) return;
      const data = event.data;
      if (!data || typeof data !== "object") return;

      if (data.type === "LANDING_PREVIEW_UPDATE") {
        setPreviewState(data.payload);
      } else if (data.type === "LANDING_PREVIEW_FOCUS" && data.sectionId) {
        setPreviewActiveSection(data.sectionId);
        const target = document.getElementById(data.sectionId);
        if (target) {
          const header = document.querySelector(".site-header");
          const offset = header ? header.offsetHeight : 0;
          const top = target.getBoundingClientRect().top + window.scrollY - offset - 10;
          window.scrollTo({ top, behavior: "smooth" });
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [isPreview]);

  useEffect(() => {
    if (!isPreview || !seller || typeof window === "undefined") return;
    window.parent?.postMessage({ type: "LANDING_PREVIEW_READY" }, window.location.origin);
  }, [isPreview, seller]);

  useEffect(() => {
    async function loadSeller() {
      try {
        const res = await fetch(`/api/sellers?slug=${encodeURIComponent(slug)}`, { cache: "no-store" });
        if (!res.ok) {
          if (res.status === 404) setError("Ejecutiva no encontrada");
          else setError("Error al cargar");
          return;
        }
        const data = await res.json();
        if (data.active === false) {
          setInactive(true);
          setLoading(false);
          return;
        }
        setSeller(data);
        setCompany(data.company);
        const companySlug = data.company?.slug;

        // Favicon dinámico según la compañía
        const favicon = document.querySelector('link[rel="icon"]');
        if (favicon && companySlug && companySlug !== "mundo") {
          const logoExt = { wom: "png", vtr: "webp", claro: "png", movistar: "png", entel: "jpg" };
          const ext = logoExt[companySlug] || "png";
          favicon.href = `/company-logos/${companySlug}.${ext}`;
        } else if (favicon) {
          favicon.href = "https://www.tumundo.cl/wp-content/uploads/2022/12/isotipo.png";
        }

        updateSellerConfig({
          name: data.name,
          phone: data.phone,
          defaultMessage: data.defaultMessage || undefined,
        });

        document.documentElement.setAttribute("data-landing-theme", data.landingTheme || "light");

        // Cargar planes de la compañía
        if (companySlug) {
          const plansRes = await fetch(`/api/plans?companySlug=${encodeURIComponent(companySlug)}`, { cache: "no-store" });
          if (plansRes.ok) {
            const plansData = await plansRes.json();
            setPlans(plansData);
            if (plansData.length > 0) {
              setFormData((prev) => ({ ...prev, plan: plansData[0].value }));
            }
          }
        }
      } catch {
        setError("Error de conexión");
      } finally {
        setLoading(false);
      }
    }
    loadSeller();
  }, [slug, isPreview]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0, rootMargin: "0px 0px -30px 0px" }
    );
    document.querySelectorAll(".scroll-animate").forEach((el) => observer.observe(el));

    // Fallback: activar elementos que ya están en viewport tras el primer paint
    const timer = setTimeout(() => {
      document.querySelectorAll(".scroll-animate:not(.active)").forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add("active");
        }
      });
    }, 100);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [loading]);

  const displaySeller = previewState?.profile
    ? { ...seller, ...previewState.profile, landingContent: previewState.content || seller?.landingContent }
    : seller;
  const displayCompany = previewState?.company ? { ...company, ...previewState.company } : company;
  const displayPlans = (previewState?.plans || plans).filter((p) => p.sellerActive !== false);
  const sellerPhoto = displaySeller?.photo || "";
  const sellerBio = displaySeller?.bio || "";
  const footerText = displaySeller?.footerText || "";
  const metaPixelId = displaySeller?.metaPixelId || "";
  const sellerLabels = getSellerLabels(displaySeller?.gender || "");
  const companyVars = getCompanyVars(displayCompany);
  const landingContent = getLandingContent(displaySeller);
  const mergedPlans = isPreview ? displayPlans : getMergedPlans(plans, displaySeller?.planOverrides);
  const featuredPlan = mergedPlans.find((p) => p.featured) || mergedPlans[0] || null;

  useEffect(() => {
    if (!displaySeller?.name) return;
    updateSellerConfig({
      name: displaySeller.name,
      phone: displaySeller.phone,
      defaultMessage: displaySeller.defaultMessage || undefined,
    });
  }, [displaySeller?.name, displaySeller?.phone, displaySeller?.defaultMessage]);

  useEffect(() => {
    if (displaySeller?.landingTheme) {
      document.documentElement.setAttribute("data-landing-theme", displaySeller.landingTheme);
    }
  }, [displaySeller?.landingTheme]);

  const scrollToSection = (id) => {
    const target = document.getElementById(id);
    if (!target) return;
    const header = document.querySelector(".site-header");
    const offset = header ? header.offsetHeight : 0;
    const top = target.getBoundingClientRect().top + window.scrollY - offset - 10;
    window.scrollTo({ top, behavior: "smooth" });
    setMenuOpen(false);
  };

  const handlePlanClick = (planValue) => {
    if (isPreview) return;
    setModalPlan(planValue);
    setModalOpen(true);
  };

  const openModal = () => {
    if (isPreview) return;
    setModalPlan("");
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    if (isPreview) {
      e.preventDefault();
      return;
    }

    e.preventDefault();
    setSubmitting(true);
    setFormStatus({ type: "", message: "" });
    const whatsappWindow = typeof window !== "undefined" ? window.open("", "_blank") : null;

    try {
      const selectedPlan = plans.find((p) => p.value === formData.plan);
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          sellerId: seller?.id,
          planId: selectedPlan?.id,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al enviar");
      }

      const labels = getSellerLabels(seller?.gender || "");
      const whatsappMessage = [
        `Hola ${seller?.name || ""}, quiero consultar por un plan.`,
        "",
        `Nombre: ${formData.name}`,
        `Teléfono: ${formData.phone}`,
        `Correo: ${formData.email || "No informado"}`,
        `Ciudad/Comuna: ${formData.city}`,
        `Dirección: ${formData.address}`,
        `Plan de interés: ${formData.plan}`,
      ].join("\n");
      const whatsappUrl = getWhatsAppUrl(whatsappMessage, seller?.phone);
      if (whatsappWindow) whatsappWindow.location.href = whatsappUrl;
      else if (typeof window !== "undefined") window.open(whatsappUrl, "_blank");

      setFormStatus({ type: "success", message: `¡Solicitud enviada! Tu ${labels.executive} te contactará pronto.` });
      setFormData((prev) => ({
        ...prev,
        name: "",
        phone: "",
        email: "",
        city: "",
        address: "",
      }));
    } catch (error) {
      if (whatsappWindow) whatsappWindow.close();
      setFormStatus({ type: "error", message: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0B0F14",
        }}
        role="status"
        aria-label="Cargando"
      >
        <span
          className="btn-spinner"
          style={{
            width: 36,
            height: 36,
            borderColor: "rgba(255,255,255,0.2)",
            borderTopColor: "rgba(255,255,255,0.9)",
          }}
        />
      </div>
    );
  }

  if (inactive) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)", color: "#fff", gap: "16px", padding: "24px", textAlign: "center" }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: "22px",
          background: "rgba(255,255,255,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 36,
        }}>
          <i className="bi bi-pause-circle-fill" />
        </div>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, marginBottom: 8 }}>Landing no disponible</h1>
          <p style={{ maxWidth: 380, opacity: 0.85, lineHeight: 1.5 }}>
            Esta página está pausada. Si eres el titular, contacta a soporte para reactivarla.
          </p>
        </div>
        <Link href="/" style={{ color: "#FDDC02", fontWeight: 700, marginTop: 8 }}>← Volver al inicio</Link>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #005A6F 0%, #00748E 100%)", color: "#fff", gap: "16px" }}>
        <h1>404</h1>
        <p>{error}</p>
        <Link href="/" style={{ color: "#FDDC02", fontWeight: 700 }}>← Volver al inicio</Link>
      </div>
    );
  }

  const wrapPreview = (id, label, child) => {
    if (!isPreview) return child;
    return (
      <PreviewWrapper id={id} label={label} active={previewActiveSection === id}>
        {child}
      </PreviewWrapper>
    );
  };

  return (
    <div data-company={displayCompany?.slug || "mundo"} style={companyVars}>
      <CompanyFonts company={displayCompany} />
      {!isPreview && <MetaPixel pixelId={metaPixelId} />}
      {wrapPreview("header", "Header", (
        <Header
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          onScrollTo={scrollToSection}
          sellerLabels={sellerLabels}
          company={displayCompany}
          content={landingContent.header}
        />
      ))}
      <main>
        {wrapPreview("hero", "Hero", (
          <Hero
            onScrollTo={scrollToSection}
            onSelectPlan={handlePlanClick}
            onOpenModal={openModal}
            company={displayCompany}
            featuredPlan={featuredPlan}
            plans={mergedPlans}
            content={landingContent.hero}
            isPreview={isPreview}
          />
        ))}
        {wrapPreview("seller", "Vendedor", (
          <SellerSection
            sellerPhotoUrl={sellerPhoto}
            sellerBioText={sellerBio}
            sellerLabels={sellerLabels}
            onScrollTo={scrollToSection}
            company={displayCompany}
            content={landingContent.seller}
          />
        ))}
        {wrapPreview("benefitsSlider", "Beneficios deslizantes", (
          <BenefitsSlider content={landingContent.benefitsSlider} />
        ))}
        {wrapPreview("plans", "Planes", (
          <PlansSection plans={mergedPlans} onSelectPlan={handlePlanClick} company={displayCompany} content={landingContent.plans} />
        ))}
        {wrapPreview("coverage", "Cobertura", (
          <CoverageSection
            formData={formData}
            setFormData={setFormData}
            formStatus={formStatus}
            submitting={submitting}
            onSubmit={handleSubmit}
            sellerLabels={sellerLabels}
            plans={mergedPlans}
            content={landingContent.coverage}
          />
        ))}
        {wrapPreview("benefits", "Beneficios", (
          <BenefitsSection companyName={displayCompany?.name || "Mundo"} content={landingContent.benefits} />
        ))}
      </main>
      {wrapPreview("footer", "Footer", (
        <Footer
          footerText={footerText}
          onScrollTo={scrollToSection}
          sellerLabels={sellerLabels}
          sellerPhone={displaySeller?.phone || ""}
          company={displayCompany}
          content={landingContent.footer}
        />
      ))}
      {isPreview && <PreviewEditBootstrap />}
      {!isPreview && <WhatsAppFloat />}
      {!isPreview && (
        <LeadModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          initialPlan={modalPlan}
           sellerId={displaySeller?.id}
           sellerName={displaySeller?.name}
           sellerPhone={displaySeller?.phone}
           plans={plans}
          companySlug={displayCompany?.slug || "mundo"}
        />
      )}
    </div>
  );
}
