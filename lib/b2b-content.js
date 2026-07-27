// Contenido estructurado de la landing B2B (portada "/").
// Se usa tanto en el render público como en el editor manual del admin.

export const DEFAULT_B2B_CONTENT = {
  header: {
    brandName: "Mundo",
    brandTag: "CRM para empresas",
    loginLabel: "Ingresar",
    navLinks: [
      { id: "solucion", label: "Solución" },
      { id: "companias", label: "Compañías" },
      { id: "beneficios", label: "Beneficios" },
    ],
  },
  hero: {
    eyebrow: "Plataforma comercial multicompañía",
    title: "Un solo lugar.",
    titleHighlight: "Todas tus ventas.",
    description:
      "El CRM creado para equipos que comercializan servicios de telecomunicaciones. Gestiona prospectos, organiza seguimientos y convierte más, sin importar la compañía.",
    ctaPrimary: "Probar gratis",
    ctaSecondary: "Conocer la plataforma",
    proofs: ["7 días gratis", "Sin permanencia"],
    imageUrl:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=88&w=1400",
    imageAlt: "Equipo comercial usando Mundo CRM",
    metricLabel: "Pipeline comercial",
    metricTag: "EN VIVO",
    metricValue: "148 oportunidades",
    metricGrowth: "↗ 18,4%",
    metricPeriod: "este mes",
    leadLabel: "Nuevo prospecto",
    leadName: "Carolina M.",
  },
  companies: {
    eyebrow: "Una plataforma",
    title: "para cada equipo comercial",
  },
  benefits: {
    eyebrow: "Hecho para vender mejor",
    title: "Menos tareas sueltas.",
    titleHighlight: "Más negocios en movimiento.",
    items: [
      {
        icon: "bi-people-fill",
        title: "Todos tus prospectos, ordenados",
        description:
          "Centraliza contactos, conversaciones y oportunidades de cada compañía en un solo lugar.",
      },
      {
        icon: "bi-lightning-charge-fill",
        title: "Seguimiento que no se detiene",
        description:
          "Prioriza cada oportunidad y llega al momento indicado con recordatorios y estados claros.",
      },
      {
        icon: "bi-bar-chart-fill",
        title: "Decisiones con datos reales",
        description:
          "Visualiza el avance comercial de tu equipo y descubre dónde se están cerrando más ventas.",
      },
    ],
  },
  cta: {
    eyebrow: "Tu próxima venta ya está esperando.",
    title: "Activa una forma más clara",
    titleHighlight: "de hacer crecer tu equipo.",
    buttonLabel: "Crear mi cuenta",
  },
  footer: {
    tagline: "Una plataforma para equipos comerciales de telecomunicaciones.",
    copyright: "© 2026 Mundo CRM",
  },
};

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function deepMerge(base, override) {
  if (!isPlainObject(override)) return base;
  const result = { ...base };
  for (const key of Object.keys(override)) {
    if (Array.isArray(override[key])) {
      result[key] = override[key];
    } else if (isPlainObject(override[key])) {
      result[key] = deepMerge(base[key] || {}, override[key]);
    } else if (override[key] !== undefined) {
      result[key] = override[key];
    }
  }
  return result;
}

export function mergeB2BContent(raw) {
  return deepMerge(DEFAULT_B2B_CONTENT, isPlainObject(raw) ? raw : {});
}
