"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { updateSellerConfig, getSellerLabels } from "@/lib/seller";
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
import Footer from "@/components/landing/Footer";
import WhatsAppFloat from "@/components/landing/WhatsAppFloat";
import LeadModal from "@/components/landing/LeadModal";

export default function SellerLanding() {
  const params = useParams();
  const slug = params.slug;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  useEffect(() => {
    async function loadSeller() {
      try {
        const res = await fetch(`/api/sellers?slug=${encodeURIComponent(slug)}`);
        if (!res.ok) {
          if (res.status === 404) setError("Ejecutiva no encontrada");
          else setError("Error al cargar");
          return;
        }
        const data = await res.json();
        setSeller(data);
        setCompany(data.company);

        // Si la compañía no es Mundo, usar la landing HTML estática personalizada
        const companySlug = data.company?.slug;
        if (companySlug && companySlug !== "mundo" && typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search);
          params.set("slug", slug);
          window.location.replace(`/landings/${companySlug}.html?${params.toString()}`);
          return;
        }

        updateSellerConfig({
          name: data.name,
          phone: data.phone,
          defaultMessage: data.defaultMessage || undefined,
        });

        if (data.landingTheme) {
          document.documentElement.setAttribute("data-landing-theme", data.landingTheme);
        }

        // Cargar planes de la compañía
        if (companySlug) {
          const plansRes = await fetch(`/api/plans?companySlug=${encodeURIComponent(companySlug)}`);
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
  }, [slug]);

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
    setModalPlan(planValue);
    setModalOpen(true);
  };

  const openModal = () => {
    setModalPlan("");
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormStatus({ type: "", message: "" });

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
      setFormStatus({ type: "success", message: `¡Solicitud enviada! Tu ${labels.executive} te contactará pronto.` });
    } catch (error) {
      setFormStatus({ type: "error", message: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #005A6F 0%, #00748E 100%)", color: "#fff" }}>
        <p>Cargando landing...</p>
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

  const sellerPhoto = seller?.photo || "";
  const sellerBio = seller?.bio || "";
  const footerText = seller?.footerText || "";
  const bgVideoUrl = seller?.bgVideoUrl || "";
  const metaPixelId = seller?.metaPixelId || "";
  const sellerLabels = getSellerLabels(seller?.gender || "");
  const companyVars = getCompanyVars(company);
  const landingContent = getLandingContent(seller);
  const mergedPlans = getMergedPlans(plans, seller?.planOverrides);
  const featuredPlan = mergedPlans.find((p) => p.featured) || mergedPlans[0] || null;

  return (
    <div data-company={company?.slug || "mundo"} style={companyVars}>
      <CompanyFonts company={company} />
      <MetaPixel pixelId={metaPixelId} />
      <Header
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        onScrollTo={scrollToSection}
        sellerLabels={sellerLabels}
        company={company}
        content={landingContent.header}
      />
      <main>
        <Hero
          bgVideoUrl={bgVideoUrl}
          onScrollTo={scrollToSection}
          onSelectPlan={handlePlanClick}
          onOpenModal={openModal}
          company={company}
          featuredPlan={featuredPlan}
          content={landingContent.hero}
        />
        <SellerSection
          sellerPhotoUrl={sellerPhoto}
          sellerBioText={sellerBio}
          sellerLabels={sellerLabels}
          onScrollTo={scrollToSection}
          company={company}
          content={landingContent.seller}
        />
        <PlansSection plans={mergedPlans} onSelectPlan={handlePlanClick} company={company} content={landingContent.plans} />
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
        <BenefitsSection companyName={company?.name || "Mundo"} content={landingContent.benefits} />
      </main>
      <Footer
        footerText={footerText}
        onScrollTo={scrollToSection}
        sellerLabels={sellerLabels}
        sellerPhone={seller?.phone || ""}
        company={company}
        content={landingContent.footer}
      />
      <WhatsAppFloat />
      <LeadModal
        key={modalOpen ? modalPlan : "closed"}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialPlan={modalPlan}
        sellerId={seller?.id}
        sellerName={seller?.name}
        plans={plans}
        companySlug={company?.slug || "mundo"}
      />
    </div>
  );
}
