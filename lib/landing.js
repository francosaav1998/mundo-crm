const DEFAULT_LANDING_CONTENT = {
  hero: {
    badge: "Promociones de Invierno",
    title: "Conéctate con la Fibra",
    titleHighlight: "más rápida de Chile",
    description:
      "Contrata hoy con asesoría personalizada. Disfruta de la mejor relación precio-calidad, instalación express y soporte dedicado sin salir de casa.",
    ctaPrimary: "Ver Planes",
    ctaSecondary: "Evaluar Cobertura",
    cardBadge: "¡El más vendido!",
    cardTitleSuffix: "FIBRA",
    cardFallbackSubtitle: "Fibra Óptica de Alta Velocidad",
    cardFallbackPrice: "Desde $12.990",
    cardFallbackPriceSubtitle: "Sujeto a factibilidad técnica.",
  },
  seller: {
    eyebrow: "Atención Personalizada",
    stats: [
      { num: "5 Min", label: "Evaluación Cobertura" },
      { num: "24-48h", label: "Tiempo Instalación" },
      { num: "100%", label: "Gestión Digital" },
    ],
    cta: "Iniciar Consulta Gratis",
  },
  plans: {
    title: "Elige el",
    titleHighlight: "Plan Perfecto",
    titleSuffix: "para Ti",
    description: "Explora las mejores ofertas en Internet Fibra Óptica y Dúos de {companyName}.",
    tabs: [
      { key: "all", label: "Todos los Planes" },
      { key: "internet", label: "Solo Internet" },
      { key: "duo", label: "Internet + TV" },
      { key: "movil", label: "Telefonía Móvil" },
    ],
  },
  benefits: {
    title: "¿Por qué contratar",
    titleSuffix: "?",
    description: "Únete a la red que está revolucionando la conectividad en el país.",
    items: [
      {
        icon: "bi-speedometer",
        title: "La Red más Veloz",
        description:
          "Premiada consecutivamente como la red de fibra óptica más rápida de Latinoamérica por Ookla Speedtest.",
      },
      {
        icon: "bi-award-fill",
        title: "Velocidad Simétrica",
        description:
          "Misma velocidad de subida y bajada. Sube archivos, juega online y haz videollamadas sin interferencia.",
      },
      {
        icon: "bi-currency-dollar",
        title: "Precio Justo y Fijo",
        description:
          "Sin tarifas sorpresa ni cobros adicionales. El valor de tu plan se mantiene en el tiempo.",
      },
      {
        icon: "bi-shield-check",
        title: "Instalación Certificada",
        description:
          "Técnicos calificados que aseguran el correcto funcionamiento e instalación óptima en tu hogar.",
      },
    ],
  },
  coverage: {
    title: "Consulta tu",
    titleHighlight: "Cobertura",
    description:
      "Ingresa tus datos y te contactaremos en minutos para confirmar la factibilidad técnica en tu domicilio.",
    steps: [
      {
        title: "Completa el formulario",
        description: "Nombre, teléfono, ciudad y dirección de instalación.",
      },
      {
        title: "Evaluamos tu zona",
        description: "Verificamos cobertura de fibra óptica en tu sector.",
      },
      {
        title: "Te contactamos",
        description: "Un ejecutivo te llama para confirmar detalles y agendar.",
      },
    ],
    formTitle: "Solicita tu Evaluación",
    submitLabel: "Enviar Solicitud",
  },
  header: {
    topHours: "Atención Express: Lun a Dom 9:00 a 21:00",
    topCoverage: "Cobertura en todo Chile",
    navLinks: [
      { id: "inicio", label: "Inicio" },
      { id: "asesor", label: "Tu Ejecutivo/a" },
      { id: "planes", label: "Planes Hogar" },
      { id: "cobertura", label: "Consultar Cobertura" },
      { id: "beneficios", label: "Beneficios" },
    ],
    cta: "Evaluar Factibilidad",
  },
  footer: {
    navTitle: "Navegación",
    contactTitle: "Contacto {executiveLabel}",
    nameLabel: "Nombre {executiveLabel}",
    whatsappLabel: "WhatsApp de Ventas",
    bottomText:
      "Los logotipos, marcas comerciales y nombres de servicios exhibidos en este sitio son propiedad exclusiva de {companyName} y sus filiales. Este sitio tiene propósitos informativos y de captación comercial por parte de un {executive} oficial independiente.",
  },
};

export function getLandingContent(seller) {
  const raw = seller?.landingContent || {};
  return deepMerge(DEFAULT_LANDING_CONTENT, raw);
}

export function getMergedPlans(plans, overrides) {
  if (!overrides || overrides.length === 0) return plans;

  const overrideMap = new Map(overrides.map((o) => [o.planId, o]));

  const merged = plans
    .map((plan) => {
      const override = overrideMap.get(plan.id);
      if (!override) return { ...plan, sellerActive: true, sellerOrder: plan.planOrder };
      const ov = override.overrides || {};
      return {
        ...plan,
        sellerActive: override.active,
        sellerOrder: override.order,
        title: ov.title || plan.title,
        speed: ov.speed || plan.speed,
        speedLabel: ov.speedLabel || plan.speedLabel,
        price: ov.price || plan.price,
        priceSubtitle: ov.priceSubtitle || plan.priceSubtitle,
        features: Array.isArray(ov.features) && ov.features.length > 0 ? ov.features : plan.features,
        featured: typeof ov.featured === "boolean" ? ov.featured : plan.featured,
        cta: ov.cta || plan.cta || "",
      };
    })
    .filter((p) => p.sellerActive !== false)
    .sort((a, b) => a.sellerOrder - b.sellerOrder);

  return merged;
}

function deepMerge(base, override) {
  if (!override || typeof override !== "object") return base;
  const result = { ...base };
  for (const key of Object.keys(override)) {
    if (Array.isArray(override[key])) {
      result[key] = override[key];
    } else if (typeof override[key] === "object" && override[key] !== null) {
      result[key] = deepMerge(base[key] || {}, override[key]);
    } else {
      result[key] = override[key];
    }
  }
  return result;
}
