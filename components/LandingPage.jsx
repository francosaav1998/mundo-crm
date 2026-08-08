"use client";

import { useEffect, useState } from "react";
import { SELLER_CONFIG, updateSellerConfig, inferGender, getSellerLabels, getDefaultBio, getDefaultFooterText } from "@/lib/seller";
import { getLandingContent } from "@/lib/landing";
import MetaPixel from "./landing/MetaPixel";
import Header from "./landing/Header";
import Hero from "./landing/Hero";
import SellerSection from "./landing/SellerSection";
import PlansSection from "./landing/PlansSection";
import CoverageSection from "./landing/CoverageSection";
import BenefitsSection from "./landing/BenefitsSection";
import Footer from "./landing/Footer";
import WhatsAppFloat from "./landing/WhatsAppFloat";
import LeadModal from "./landing/LeadModal";
import { isTurnstileEnabled } from "@/lib/turnstile";

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    address: "",
    plan: "Plan Fibra 800 Megas ($12.990)",
  });
  const [formStatus, setFormStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPlan, setModalPlan] = useState("");
  const [sellerPhotoUrl, setSellerPhotoUrl] = useState("");
  const [sellerBioText, setSellerBioText] = useState(getDefaultBio("", "Mundo"));
  const [footerText, setFooterText] = useState(getDefaultFooterText("", "Mundo"));
  const [sellerName, setSellerName] = useState(SELLER_CONFIG.name);
  const [sellerGender, setSellerGender] = useState("");
  const [metaPixelId, setMetaPixelId] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);

  const turnstileEnabled = isTurnstileEnabled();

  const sellerLabels = getSellerLabels(sellerGender || inferGender(sellerName));

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        if (!res.ok) return;
        const settings = await res.json();

        updateSellerConfig({
          name: settings.seller_name,
          phone: settings.whatsapp_number || settings.seller_phone,
          defaultMessage: settings.seller_msg,
        });

        if (settings.seller_name) setSellerName(settings.seller_name);
        if (settings.seller_gender !== undefined) {
          setSellerGender(settings.seller_gender);
          // Actualizar textos por defecto con el género cargado si no hay bio/footer personalizados
          if (!settings.seller_bio) setSellerBioText(getDefaultBio(settings.seller_gender, "Mundo"));
          if (!settings.footer_text) setFooterText(getDefaultFooterText(settings.seller_gender, "Mundo"));
        }
        if (settings.seller_bio) setSellerBioText(settings.seller_bio);
        if (settings.seller_photo) setSellerPhotoUrl(settings.seller_photo);
        if (settings.footer_text !== undefined) setFooterText(settings.footer_text);
        if (settings.meta_pixel_id !== undefined) setMetaPixelId(settings.meta_pixel_id);
        if (settings.landing_theme) {
          document.documentElement.setAttribute("data-landing-theme", settings.landing_theme);
        }
      } catch {
        // Fallback: keep defaults if the API fails
      }
    }
    loadSettings();
  }, []);

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
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    document.querySelectorAll(".scroll-animate").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

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
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, turnstileToken }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al enviar");
      }

      setFormStatus({ type: "success", message: `¡Solicitud enviada! Tu ${sellerLabels.executive} te contactará pronto.` });
      setFormData({
        name: "",
        phone: "",
        email: "",
        city: "",
        address: "",
        plan: formData.plan,
      });
    } catch (error) {
      setFormStatus({ type: "error", message: error.message });
    } finally {
      setTurnstileToken("");
      setTurnstileResetKey((value) => value + 1);
      setSubmitting(false);
    }
  };

  return (
    <>
      <MetaPixel pixelId={metaPixelId} />
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} onScrollTo={scrollToSection} sellerLabels={sellerLabels} content={getLandingContent(null).header} />
      <main>
        <Hero onScrollTo={scrollToSection} onSelectPlan={handlePlanClick} onOpenModal={openModal} />
        <SellerSection
          sellerPhotoUrl={sellerPhotoUrl}
          sellerBioText={sellerBioText}
          sellerLabels={sellerLabels}
          onScrollTo={scrollToSection}
        />
        <PlansSection onSelectPlan={handlePlanClick} />
        <CoverageSection
          formData={formData}
          setFormData={setFormData}
          formStatus={formStatus}
          submitting={submitting}
          onSubmit={handleSubmit}
          sellerLabels={sellerLabels}
          turnstileEnabled={turnstileEnabled}
          turnstileToken={turnstileToken}
          onTurnstileChange={setTurnstileToken}
          turnstileResetKey={turnstileResetKey}
        />
        <BenefitsSection />
      </main>
      <Footer footerText={footerText} onScrollTo={scrollToSection} sellerLabels={sellerLabels} sellerPhone={SELLER_CONFIG.phone} />
      <WhatsAppFloat />
      <LeadModal
        key={modalOpen ? modalPlan : "closed"}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialPlan={modalPlan}
        sellerName={sellerName}
        companySlug="mundo"
      />
    </>
  );
}
