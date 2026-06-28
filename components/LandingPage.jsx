"use client";

import { useEffect, useState, useRef } from "react";
import { SELLER_CONFIG, sendWhatsAppMessage, updateSellerConfig } from "@/lib/seller";

function useTheme() {
  const [theme, setThemeState] = useState("light");
  useEffect(() => {
    const saved = localStorage.getItem("landing_theme") || "light";
    setThemeState(saved);
    document.documentElement.setAttribute("data-landing-theme", saved);
  }, []);
  const setTheme = (t) => {
    setThemeState(t);
    localStorage.setItem("landing_theme", t);
    document.documentElement.setAttribute("data-landing-theme", t);
  };
  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");
  return { theme, toggle, setTheme };
}

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState("all");
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
  const { theme } = useTheme();
  const [sellerPhotoUrl, setSellerPhotoUrl] = useState(
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400"
  );
  const [sellerBioText, setSellerBioText] = useState(
    "Como tu ejecutiva comercial especializada de Mundo, te ayudo a gestionar tu contrato de forma rápida y transparente. Olvídate de largas esperas en call centers. Analizo la cobertura de tu sector en minutos y agendo tu instalación en tiempo récord."
  );
  const [footerText, setFooterText] = useState(
    "Tu asesora comercial autorizada de Mundo. Gestión ágil, directa y transparente de tus planes de internet fibra, televisión digital y telefonía móvil."
  );
  const [bgVideoUrl, setBgVideoUrl] = useState("");
  const [sellerName, setSellerName] = useState(SELLER_CONFIG.name);
  const [sellerDefaultMessage, setSellerDefaultMessage] = useState(SELLER_CONFIG.defaultMessage);

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
        if (settings.seller_msg) setSellerDefaultMessage(settings.seller_msg);
        if (settings.seller_photo) setSellerPhotoUrl(settings.seller_photo);
        if (settings.seller_bio) setSellerBioText(settings.seller_bio);
        if (settings.footer_text !== undefined) setFooterText(settings.footer_text);
        if (settings.bg_video_url !== undefined) setBgVideoUrl(settings.bg_video_url || "");
      } catch {
        // Fallback: keep defaults if the API fails
      }
    }
    loadSettings();
  }, []);

  const planButtons = useRef([]);

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
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al enviar");
      }

      setFormStatus({ type: "success", message: "¡Datos enviados! Te redirigimos a WhatsApp." });

      const text = `*CONSULTA DE COBERTURA - MUNDO*\n\n` +
        `📌 *Información del Solicitante:*\n` +
        `• *Nombre:* ${formData.name}\n` +
        `• *Teléfono:* ${formData.phone}\n` +
        `• *Email:* ${formData.email || "No proporcionado"}\n` +
        `• *Comuna/Ciudad:* ${formData.city}\n` +
        `• *Dirección:* ${formData.address}\n\n` +
        `📦 *Servicio de Interés:*\n` +
        `• *Plan Seleccionado:* ${formData.plan}\n\n` +
        `Hola ${sellerName}, me gustaría verificar la factibilidad técnica para instalar este servicio en mi domicilio.`;

      setTimeout(() => {
        sendWhatsAppMessage(text);
      }, 600);
    } catch (error) {
      setFormStatus({ type: "error", message: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  const plans = [
    {
      category: "internet",
      title: "Fibra Súper Rápida",
      speed: "800 Mbps",
      speedLabel: "Simétricos",
      price: "$12.990",
      subtitle: "Valor mensual final. Fibra óptica directa.",
      features: [
        { icon: "bi-speedometer2", text: "Velocidad simétrica ideal para streaming" },
        { icon: "bi-router-fill", text: "Router Wi-Fi de alta cobertura" },
        { icon: "bi-infinity", text: "Navegación ilimitada sin límites de descarga" },
        { icon: "bi-x-circle", text: "Canales de TV Digital", unavailable: true },
      ],
      cta: "Contratar Plan",
      value: "Plan Fibra 800 Megas ($12.990)",
    },
    {
      category: "internet",
      title: "Hiper Fibra Giga",
      speed: "1 Giga",
      speedLabel: "(1000 Mbps)",
      price: "$15.990",
      subtitle: "Velocidad extrema para múltiples dispositivos.",
      features: [
        { icon: "bi-speedometer2", text: "Velocidad máxima de 1000 Mbps" },
        { icon: "bi-router-fill", text: "Router de alto rendimiento (Dual Band)" },
        { icon: "bi-gamepad", text: "Ideal para teletrabajo, gaming y 4K" },
        { icon: "bi-x-circle", text: "Canales de TV Digital", unavailable: true },
      ],
      cta: "Contratar Plan",
      featured: true,
      value: "Plan Hiper Fibra 1 Giga ($15.990)",
    },
    {
      category: "duo",
      title: "Dúo Pack Plus",
      speed: "800 Mbps",
      speedLabel: "+ TV GO!",
      price: "$23.990",
      subtitle: "Internet + TV interactiva.",
      features: [
        { icon: "bi-speedometer2", text: "800 Mbps simétricos de velocidad" },
        { icon: "bi-tv", text: "Mundo GO! con más de 100 canales HD" },
        { icon: "bi-arrow-clockwise", text: "Pausa, retrocede y repite programación" },
        { icon: "bi-phone-vibrate", text: "Acceso a la app de TV para tu celular" },
      ],
      cta: "Contratar Dúo",
      value: "Plan Dúo 800 Megas + TV ($23.990)",
    },
    {
      category: "duo",
      title: "Dúo Pack Premium Giga",
      speed: "1 Giga",
      speedLabel: "+ TV GO!",
      price: "$26.990",
      subtitle: "La experiencia de entretenimiento definitiva.",
      features: [
        { icon: "bi-speedometer2", text: "1000 Mbps de velocidad extrema" },
        { icon: "bi-tv", text: "Mundo GO! Premium + canales interactivos" },
        { icon: "bi-display", text: "Compatible con Smart TV, consolas y PCs" },
        { icon: "bi-lightning-charge", text: "Menor latencia del mercado chileno" },
      ],
      cta: "Contratar Dúo",
      value: "Plan Dúo 1 Giga + TV ($26.990)",
    },
    {
      category: "movil",
      title: "Móvil Portabilidad",
      speed: "Gigas Libres",
      speedLabel: "4G/5G",
      price: "$5.990",
      subtitle: "Cámbiate conservando tu número actual.",
      features: [
        { icon: "bi-telephone-fill", text: "Minutos libres a todo destino" },
        { icon: "bi-chat-left-dots-fill", text: "Redes sociales libres (WhatsApp, RRSS)" },
        { icon: "bi-globe", text: "Gigas libres para navegación" },
        { icon: "bi-check2-all", text: "Sin contratos de permanencia obligatoria" },
      ],
      cta: "Portarme Ahora",
      value: "Plan Móvil Gigas Libres ($5.990)",
    },
  ];

  const filteredPlans = activeTab === "all" ? plans : plans.filter((p) => p.category === activeTab);

  return (
    <>
      <div className="header-top">
        <div className="container">
          <div className="header-top-info">
            <span><i className="bi bi-clock-fill"></i> Atención Express: Lun a Dom 9:00 a 21:00</span>
            <span><i className="bi bi-geo-alt-fill"></i> Cobertura en todo Chile</span>
          </div>
          <div><span>Ejecutiva de Ventas Oficial Mundo</span></div>
        </div>
      </div>

      <header className="site-header">
        <div className="container">
          <nav className="main-nav">
            <a href="#inicio" className="logo" onClick={(e) => { e.preventDefault(); scrollToSection("inicio"); }}>
              <img src="https://www.tumundo.cl/wp-content/uploads/2022/12/logo-mundo-negative.svg" alt="Mundo Logo" />
            </a>
            <ul className={`nav-links ${menuOpen ? "mobile-active" : ""}`}>
              <li><a href="#inicio" onClick={(e) => { e.preventDefault(); scrollToSection("inicio"); }}>Inicio</a></li>
              <li><a href="#asesor" onClick={(e) => { e.preventDefault(); scrollToSection("asesor"); }}>Tu Ejecutiva</a></li>
              <li><a href="#planes" onClick={(e) => { e.preventDefault(); scrollToSection("planes"); }}>Planes Hogar</a></li>
              <li><a href="#cobertura" onClick={(e) => { e.preventDefault(); scrollToSection("cobertura"); }}>Consultar Cobertura</a></li>
              <li><a href="#beneficios" onClick={(e) => { e.preventDefault(); scrollToSection("beneficios"); }}>Beneficios</a></li>
            </ul>
            <div className="nav-cta">
              <button onClick={() => scrollToSection("cobertura")} className="btn btn-secondary">
                <i className="bi bi-geo-fill"></i> Evaluar Factibilidad
              </button>
            </div>
            <button className="menu-toggle" aria-label="Abrir MenÃº" onClick={() => setMenuOpen(!menuOpen)}>
              <i className={menuOpen ? "bi bi-x-lg" : "bi bi-list"}></i>
            </button>
          </nav>
        </div>
      </header>

      <main>
        <section id="inicio" className="hero">
          {/* Video de fondo solo en la primera sección */}
          {bgVideoUrl && (
            <div className="hero-video-bg" aria-hidden="true">
              <video
                className="hero-video-bg__el"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
              >
                <source src={bgVideoUrl} type="video/mp4" />
              </video>
              <div className="hero-video-bg__overlay" />
            </div>
          )}
          <div className="container">
            <div className="hero-content scroll-animate fade-in-left">
              <span className="badge-promo"><i className="bi bi-lightning-charge-fill"></i> Promociones de Invierno</span>
              <h1>Conéctate con la Fibra <span>más rápida de Chile</span></h1>
              <p>Contrata hoy con asesoría personalizada directa a tu WhatsApp. Disfruta de la mejor relación precio-calidad, instalación express y soporte dedicado sin salir de casa.</p>
              <div className="hero-ctas">
                <button onClick={() => scrollToSection("planes")} className="btn btn-secondary">Ver Planes</button>
                <button onClick={() => scrollToSection("cobertura")} className="btn btn-outline" style={{ borderColor: "#fff", color: "#fff" }}>Evaluar Cobertura</button>
              </div>
            </div>

            <div className="hero-image-container scroll-animate fade-in-right">
              <div className="hero-card">
                <span className="badge-promo">¡El más vendido!</span>
                <div className="hero-card-title">MUNDO FIBRA</div>
                <div className="hero-card-subtitle">800 Megas Simétricos</div>
                <div className="hero-card-price">$12.990 <span>/ mes</span></div>
                <div className="hero-card-price-sub">Precio fijo para siempre, sujeto a factibilidad técnica.</div>
                <ul className="hero-card-features">
                  <li><i className="bi bi-check-circle-fill"></i> 800 Mbps Súbida / 800 Mbps Bajada</li>
                  <li><i className="bi bi-check-circle-fill"></i> Router Wi-Fi de última generación</li>
                  <li><i className="bi bi-check-circle-fill"></i> Instalación fibra óptica directa al hogar</li>
                  <li><i className="bi bi-check-circle-fill"></i> Soporte técnico prioritario</li>
                </ul>
                <button
                  onClick={() => handlePlanClick("Plan Fibra 800 Megas ($12.990)")}
                  className="btn btn-primary btn-whatsapp plan-cta w-100"
                >
                  <i className="bi bi-whatsapp"></i> Contratar por WhatsApp
                </button>
              </div>
            </div>
          </div>
        </section>

        <section id="asesor" className="seller-section scroll-animate fade-in-up">
          <div className="container">
            <div className="seller-card">
              <div className="seller-avatar-wrapper">
                <img src={sellerPhotoUrl} alt="Asesora de Ventas Mundo" loading="lazy" />
                <span className="seller-badge">Asesora Oficial</span>
              </div>
              <div className="seller-info">
                <h4>Atención Personalizada</h4>
                <h2 className="seller-name-placeholder">{SELLER_CONFIG.name}</h2>
                <p>{sellerBioText}</p>
                <div className="seller-stats">
                  <div className="stat-item"><span className="stat-num">5 Min</span><span className="stat-label">Evaluación Cobertura</span></div>
                  <div className="stat-item"><span className="stat-num">24-48h</span><span className="stat-label">Tiempo Instalación</span></div>
                  <div className="stat-item"><span className="stat-num">100%</span><span className="stat-label">Gestión Digital</span></div>
                </div>
                <button onClick={() => scrollToSection("cobertura")} className="btn btn-primary">
                  <i className="bi bi-chat-dots-fill"></i> Iniciar Consulta Gratis
                </button>
              </div>
            </div>
          </div>
        </section>

        <section id="planes" className="planes-section">
          <div className="container">
            <div className="section-header scroll-animate fade-in-up">
              <h2>Elige el <span>Plan Perfecto</span> para Ti</h2>
              <p>Explora nuestras mejores ofertas en Internet Fibra Óptica, Dúos (Internet + Televisión) y Planes Móviles.</p>
            </div>

            <div className="planes-tabs scroll-animate fade-in-up delay-1">
              {[
                { key: "all", label: "Todos los Planes" },
                { key: "internet", label: "Solo Internet" },
                { key: "duo", label: "Internet + TV" },
                { key: "movil", label: "Telefonía Móvil" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  className={`tab-btn ${activeTab === tab.key ? "active" : ""}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="planes-grid">
              {filteredPlans.map((plan, index) => (
                <div
                  key={plan.title}
                  className={`plan-card scroll-animate fade-in-up delay-${(index % 3) + 1} ${plan.featured ? "featured" : ""}`}
                >
                  <div className="plan-header">
                    <h3 className="plan-title">{plan.title}</h3>
                    <div className="plan-internet">{plan.speed} <span>{plan.speedLabel}</span></div>
                    <div className="plan-price">{plan.price} <span>/ mes</span></div>
                    <p className="plan-price-sub">{plan.subtitle}</p>
                  </div>
                  <ul className="plan-features">
                    {plan.features.map((f, i) => (
                      <li key={i} className={f.unavailable ? "unavailable" : ""}>
                        <i className={f.unavailable ? f.icon : `bi ${f.icon}`}></i> {f.text}
                      </li>
                    ))}
                  </ul>
                  <div className="plan-cta">
                    <button
                      onClick={() => handlePlanClick(plan.value)}
                      className={`btn btn-whatsapp w-100 ${plan.featured ? "btn-primary" : ""}`}
                    >
                      <i className="bi bi-whatsapp"></i> {plan.cta}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="cobertura" className="coverage-section">
          <div className="container">
            <div className="coverage-layout">
              <div className="coverage-info scroll-animate fade-in-left">
                <h2>¿Tienes Cobertura en tu Sector? <span>¡Compruébalo Gratis!</span></h2>
                <p>Completa el siguiente formulario con tus datos de ubicación. Evaluaremos inmediatamente la cobertura de fibra óptica en tu zona y te contactaremos por WhatsApp con las ofertas disponibles.</p>
                <div className="coverage-steps">
                  <div className="step-card">
                    <div className="step-num">1</div>
                    <div className="step-text"><h4>Ingresa tus datos</h4><p>Escribe tu nombre, comuna y dirección completa.</p></div>
                  </div>
                  <div className="step-card">
                    <div className="step-num">2</div>
                    <div className="step-text"><h4>Selecciona tu plan</h4><p>Indícanos cuál es el plan de tu interés o si buscas asesoría.</p></div>
                  </div>
                  <div className="step-card">
                    <div className="step-num">3</div>
                    <div className="step-text"><h4>¡Listo para contactar!</h4><p>Presiona enviar y envíanos la solicitud directo a WhatsApp en un clic.</p></div>
                  </div>
                </div>
              </div>

              <div className="coverage-card scroll-animate fade-in-right">
                <h3>Consultar Factibilidad Técnica</h3>
                {formStatus.message && (
                  <div className={`form-message ${formStatus.type}`}>{formStatus.message}</div>
                )}
                <form id="coverage-form" onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="client-name">Nombre y Apellido *</label>
                    <input type="text" id="client-name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Ej. Juan Pérez" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="client-phone">Número de Contacto *</label>
                    <input type="tel" id="client-phone" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="Ej. +569 1234 5678" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="client-email">Correo Electrónico</label>
                    <input type="email" id="client-email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="Ej. juan@correo.cl" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="client-city">Comuna / Ciudad *</label>
                    <input type="text" id="client-city" required value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder="Ej. Concepción, Temuco, etc." />
                  </div>
                  <div className="form-group">
                    <label htmlFor="client-address">Dirección y Numeración *</label>
                    <input type="text" id="client-address" required value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Ej. Av. Central 1234, Depto 40" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="client-plan">Plan de Interés</label>
                    <select id="client-plan" value={formData.plan} onChange={(e) => setFormData({ ...formData, plan: e.target.value })}>
                      <option value="Plan Fibra 800 Megas ($12.990)">Plan Fibra 800 Megas ($12.990/mes)</option>
                      <option value="Plan Hiper Fibra 1 Giga ($15.990)">Plan Hiper Fibra 1 Giga ($15.990/mes)</option>
                      <option value="Plan Dúo 800 Megas + TV ($23.990)">Plan Dúo 800 Megas + TV ($23.990/mes)</option>
                      <option value="Plan Dúo 1 Giga + TV ($26.990)">Plan Dúo 1 Giga + TV ($26.990/mes)</option>
                      <option value="Plan Móvil Gigas Libres ($5.990)">Plan Móvil Gigas Libres ($5.990/mes)</option>
                      <option value="Necesito Asesoría / Otro">Necesito Asesoría / Otros Planes</option>
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
                    <i className="bi bi-whatsapp"></i> {submitting ? "Enviando..." : "Consultar por WhatsApp"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        <section id="beneficios" className="benefits-section">
          <div className="container">
            <div className="section-header scroll-animate fade-in-up">
              <h2>¿Por qué contratar <span>Mundo</span>?</h2>
              <p>Únete a la red que está revolucionando la conectividad en el país.</p>
            </div>
            <div className="benefits-grid">
              <div className="benefit-card scroll-animate fade-in-up delay-1">
                <div className="benefit-icon"><i className="bi bi-speedometer"></i></div>
                <h3>La Red más Veloz</h3>
                <p>Premiada consecutivamente como la red de fibra óptica más rápida de Latinoamérica por Ookla Speedtest.</p>
              </div>
              <div className="benefit-card scroll-animate fade-in-up delay-2">
                <div className="benefit-icon"><i className="bi bi-award-fill"></i></div>
                <h3>Velocidad Simétrica</h3>
                <p>Misma velocidad de subida y bajada. Sube archivos, juega online y haz videollamadas sin interferencia.</p>
              </div>
              <div className="benefit-card scroll-animate fade-in-up delay-3">
                <div className="benefit-icon"><i className="bi bi-currency-dollar"></i></div>
                <h3>Precio Justo y Fijo</h3>
                <p>Sin tarifas sorpresa ni cobros adicionales. El valor de tu plan se mantiene en el tiempo.</p>
              </div>
              <div className="benefit-card scroll-animate fade-in-up delay-4">
                <div className="benefit-icon"><i className="bi bi-shield-check"></i></div>
                <h3>Instalación Certificada</h3>
                <p>Técnicos calificados que aseguran el correcto funcionamiento e instalación óptima en tu hogar.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container">
          <div className="footer-layout">
            <div className="footer-about">
              <img src="https://www.tumundo.cl/wp-content/uploads/2022/12/logo-mundo.svg" alt="Mundo Logo Footer" />
              <p>{footerText}</p>
            </div>
            <div className="footer-links">
              <h4>Navegación</h4>
              <ul>
                <li><a href="#inicio" onClick={(e) => { e.preventDefault(); scrollToSection("inicio"); }}>Inicio</a></li>
                <li><a href="#asesor" onClick={(e) => { e.preventDefault(); scrollToSection("asesor"); }}>Tu Ejecutiva</a></li>
                <li><a href="#planes" onClick={(e) => { e.preventDefault(); scrollToSection("planes"); }}>Planes Hogar</a></li>
                <li><a href="#cobertura" onClick={(e) => { e.preventDefault(); scrollToSection("cobertura"); }}>Evaluar Cobertura</a></li>
              </ul>
            </div>
            <div className="footer-contact">
              <h4>Contacto Ejecutiva</h4>
              <ul>
                <li>
                  <i className="bi bi-person-fill"></i>
                  <div>
                    <span className="footer-contact-title">Nombre Asesora</span>
                    <span className="seller-name-placeholder">{sellerName}</span>
                  </div>
                </li>
                <li>
                  <i className="bi bi-whatsapp"></i>
                  <div>
                    <span className="footer-contact-title">WhatsApp de Ventas</span>
                    <span>Atención Digital Inmediata</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 Mundo Telecomunicaciones. Página web de Asesora de Ventas Oficial Independiente.</p>
            <p style={{ marginTop: "0.5rem", fontSize: "0.75rem" }}>Los logotipos, marcas comerciales y nombres de servicios exhibidos en este sitio son propiedad exclusiva de Mundo Pacífico S.A. y sus filiales. Este sitio tiene propósitos informativos y de captación comercial por parte de una ejecutiva oficial independiente.</p>
          </div>
        </div>
      </footer>

      <div className="whatsapp-float" aria-label="Hablar por WhatsApp" onClick={() => sendWhatsAppMessage(SELLER_CONFIG.defaultMessage)}>
        <i className="bi bi-whatsapp"></i>
      </div>
    </>
  );
}
