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
    bg: "#0f0f1a",
    bgGradient: "#0f0f1a",
    bgCard: "rgba(255, 255, 255, 0.03)",
    text: "#f0f0f5",
    muted: "rgba(255, 255, 255, 0.55)",
    accent: "#d4a574",
    accent2: "#b08a5f",
    accent3: "#8f7350",
    accent4: "#10b981",
    secondary: "#8080ff",
    border: "rgba(255, 255, 255, 0.06)",
    glowGold: "0 0 20px rgba(212,165,116,0.25), 0 0 40px rgba(212,165,116,0.08)",
    glowLilac: "0 0 20px rgba(128,128,255,0.25), 0 0 40px rgba(128,128,255,0.08)",
    gradientBar: "linear-gradient(180deg, #d4a574 0%, #b08a5f 100%)",
    sidebarBg: "rgba(15, 15, 26, 0.95)",
    headerBg: "rgba(15, 15, 26, 0.8)",
    inputBg: "rgba(255, 255, 255, 0.04)",
    sidebarText: "#f0f0f5",
    sidebarMuted: "rgba(255, 255, 255, 0.55)",
    headerText: "#f0f0f5",
    headerMuted: "rgba(255, 255, 255, 0.55)",
  },
  light: {
    bg: "#faf9f7",
    bgGradient: "#faf9f7",
    bgCard: "rgba(255, 255, 255, 0.82)",
    text: "#1a1a2e",
    muted: "#6b6b7b",
    accent: "#b08a5f",
    accent2: "#8f7350",
    accent3: "#6b5ce7",
    accent4: "#10b981",
    secondary: "#6b5ce7",
    border: "rgba(0, 0, 0, 0.06)",
    glowGold: "0 0 20px rgba(176,138,95,0.18), 0 0 40px rgba(176,138,95,0.06)",
    glowLilac: "0 0 20px rgba(107,92,231,0.18), 0 0 40px rgba(107,92,231,0.06)",
    gradientBar: "linear-gradient(180deg, #b08a5f 0%, #8f7350 100%)",
    sidebarBg: "rgba(250, 249, 247, 0.95)",
    headerBg: "rgba(250, 249, 247, 0.8)",
    inputBg: "rgba(0, 0, 0, 0.03)",
    sidebarText: "#1a1a2e",
    sidebarMuted: "#6b6b7b",
    headerText: "#1a1a2e",
    headerMuted: "#6b6b7b",
  },
};

export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 25,
};
