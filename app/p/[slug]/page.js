"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { updateSellerConfig, sendWhatsAppMessage } from "@/lib/seller";
import MetaPixel from "@/components/landing/MetaPixel";
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import SellerSection from "@/components/landing/SellerSection";
import PlansSection from "@/components/landing/PlansSection";
import CoverageSection from "@/components/landing/CoverageSection";
import BenefitsSection from "@/components/landing/BenefitsSection";
import Footer from "@/components/landing/Footer";
import WhatsAppFloat from "@/components/landing/WhatsAppFloat";

export default function SellerLanding() {
  const params = useParams();
  const slug = params.slug;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seller, setSeller] = useState(null);
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

        updateSellerConfig({
          name: data.name,
          phone: data.phone,
        });

        if (data.landingTheme) {
          document.documentElement.setAttribute("data-landing-theme", data.landingTheme);
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
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    document.querySelectorAll(".scroll-animate").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
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
    setFormData((prev) => ({ ...prev, plan: planValue }));
    scrollToSection("cobertura");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormStatus({ type: "", message: "" });

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, sellerId: seller?.id }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al enviar");
      }

      setFormStatus({ type: "success", message: "¡Datos enviados! Te redirigimos a WhatsApp." });

      const text =
        `*CONSULTA DE COBERTURA - MUNDO*\n\n` +
        `📌 *Información del Solicitante:*\n` +
        `• *Nombre:* ${formData.name}\n` +
        `• *Teléfono:* ${formData.phone}\n` +
        `• *Email:* ${formData.email || "No proporcionado"}\n` +
        `• *Comuna/Ciudad:* ${formData.city}\n` +
        `• *Dirección:* ${formData.address}\n\n` +
        `📦 *Servicio de Interés:*\n` +
        `• *Plan Seleccionado:* ${formData.plan}\n\n` +
        `Hola ${seller?.name || ""}, me gustaría verificar la factibilidad técnica para instalar este servicio en mi domicilio.`;

      setTimeout(() => sendWhatsAppMessage(text), 600);
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
  const sellerBio = seller?.bio || "Como tu ejecutiva comercial especializada de Mundo, te ayudo a gestionar tu contrato de forma rápida y transparente.";
  const footerText = seller?.footerText || "Tu asesora comercial autorizada de Mundo. Gestión ágil, directa y transparente.";
  const bgVideoUrl = seller?.bgVideoUrl || "";
  const metaPixelId = seller?.metaPixelId || "";

  return (
    <>
      <MetaPixel pixelId={metaPixelId} />
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} onScrollTo={scrollToSection} />
      <main>
        <Hero bgVideoUrl={bgVideoUrl} onScrollTo={scrollToSection} onSelectPlan={handlePlanClick} />
        <SellerSection
          sellerPhotoUrl={sellerPhoto}
          sellerBioText={sellerBio}
          onScrollTo={scrollToSection}
        />
        <PlansSection onSelectPlan={handlePlanClick} />
        <CoverageSection
          formData={formData}
          setFormData={setFormData}
          formStatus={formStatus}
          submitting={submitting}
          onSubmit={handleSubmit}
        />
        <BenefitsSection />
      </main>
      <Footer footerText={footerText} onScrollTo={scrollToSection} />
      <WhatsAppFloat />
    </>
  );
}