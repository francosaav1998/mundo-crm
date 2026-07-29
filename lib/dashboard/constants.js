export const STATUSES = [
  "Nuevo",
  "No Contesta",
  "Contactado",
  "En Proceso",
  "Con Factibilidad",
  "Sin Factibilidad",
];

export const STATUS_CONFIG = {
  Nuevo: {
    bg: "rgba(0, 180, 216, 0.1)",
    text: "#00B4D8",
    dot: "#00B4D8",
    label: "Nuevo",
    icon: "bi-star-fill",
  },
  "No Contesta": {
    bg: "rgba(239, 68, 68, 0.1)",
    text: "#EF4444",
    dot: "#EF4444",
    label: "No Contesta",
    icon: "bi-telephone-x-fill",
  },
  Contactado: {
    bg: "rgba(37, 211, 102, 0.1)",
    text: "#25D366",
    dot: "#25D366",
    label: "Contactado",
    icon: "bi-chat-dots-fill",
  },
  "En Proceso": {
    bg: "rgba(253, 220, 2, 0.15)",
    text: "#FDDC02",
    dot: "#FDDC02",
    label: "En Proceso",
    icon: "bi-arrow-repeat",
  },
  "Con Factibilidad": {
    bg: "rgba(16, 185, 129, 0.1)",
    text: "#10B981",
    dot: "#10B981",
    label: "Con Factibilidad",
    icon: "bi-check-circle-fill",
  },
  "Sin Factibilidad": {
    bg: "rgba(249, 115, 22, 0.1)",
    text: "#F97316",
    dot: "#F97316",
    label: "Sin Factibilidad",
    icon: "bi-x-circle-fill",
  },
};

// Estados del pipeline B2B del admin (gestión de vendedores-clientes)
export const ADMIN_STATUSES = [
  "Nuevo",
  "Contactado",
  "Interesado",
  "Cliente Activo",
  "No Interesado",
];

export const ADMIN_STATUS_CONFIG = {
  Nuevo: {
    bg: "rgba(0, 180, 216, 0.1)",
    text: "#00B4D8",
    label: "Nuevo",
    icon: "bi-star-fill",
  },
  Contactado: {
    bg: "rgba(128, 128, 255, 0.12)",
    text: "#8080FF",
    label: "Contactado",
    icon: "bi-chat-dots-fill",
  },
  Interesado: {
    bg: "rgba(245, 158, 11, 0.12)",
    text: "#F59E0B",
    label: "Interesado",
    icon: "bi-fire",
  },
  "Cliente Activo": {
    bg: "rgba(16, 185, 129, 0.1)",
    text: "#10B981",
    label: "Cliente Activo",
    icon: "bi-check-circle-fill",
  },
  "No Interesado": {
    bg: "rgba(239, 68, 68, 0.1)",
    text: "#EF4444",
    label: "No Interesado",
    icon: "bi-x-circle-fill",
  },
};

export const NEON_THEME = {
  dark: {
    bg: "#0b0f14",
    bgGradient: "linear-gradient(180deg, #0b0f14 0%, #0e141c 100%)",
    bgCard: "#111822",
    text: "#f4f7fb",
    muted: "#96a2b4",
    accent: "#4f8cff",
    accent2: "#72a6ff",
    accent3: "#cfd8e6",
    accent4: "#10b981",
    secondary: "#223044",
    border: "rgba(255, 255, 255, 0.08)",
    glowGold: "0 18px 40px rgba(79, 140, 255, 0.16)",
    glowLilac: "0 18px 40px rgba(114, 166, 255, 0.14)",
    gradientBar: "linear-gradient(180deg, #4f8cff 0%, #72a6ff 100%)",
    sidebarBg: "rgba(9, 12, 18, 0.92)",
    headerBg: "rgba(11, 15, 20, 0.8)",
    inputBg: "rgba(255, 255, 255, 0.03)",
    sidebarText: "#f4f7fb",
    sidebarMuted: "#8f9db1",
    headerText: "#f4f7fb",
    headerMuted: "#8f9db1",
  },
  light: {
    bg: "#f5f7fb",
    bgGradient: "linear-gradient(180deg, #f5f7fb 0%, #eef3f9 100%)",
    bgCard: "rgba(255, 255, 255, 0.88)",
    text: "#111827",
    muted: "#66758b",
    accent: "#2563eb",
    accent2: "#4f8cff",
    accent3: "#cfd8e6",
    accent4: "#10b981",
    secondary: "#dbe5f2",
    border: "rgba(15, 23, 42, 0.08)",
    glowGold: "0 18px 36px rgba(37, 99, 235, 0.1)",
    glowLilac: "0 18px 36px rgba(79, 140, 255, 0.1)",
    gradientBar: "linear-gradient(180deg, #2563eb 0%, #4f8cff 100%)",
    sidebarBg: "rgba(246, 249, 252, 0.94)",
    headerBg: "rgba(245, 247, 251, 0.84)",
    inputBg: "rgba(15, 23, 42, 0.03)",
    sidebarText: "#111827",
    sidebarMuted: "#66758b",
    headerText: "#111827",
    headerMuted: "#66758b",
  },
};

export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 25,
};
