"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { normalizeWhatsAppNumber } from "@/lib/seller";

const STATUSES = [
  "Nuevo",
  "No Contesta",
  "Contactado",
  "En Proceso",
  "Con Factibilidad",
  "Sin Factibilidad",
];

// Temática Mundo (Celeste, Azul y Amarillo)
const STATUS_CONFIG = {
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

function useTheme() {
  const [theme, setThemeState] = useState("light");
  useEffect(() => {
    const saved = localStorage.getItem("theme") || "light";
    setThemeState(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);
  const setTheme = (t) => {
    setThemeState(t);
    localStorage.setItem("theme", t);
    document.documentElement.setAttribute("data-theme", t);
  };
  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");
  return { theme, toggle, setTheme };
}

// Neon color palette for light/dark (Celeste, Oscuro, Amarillo)
const NEON_THEME = {
  dark: {
    bg: "#090E1A",
    bgGradient: "#090E1A",
    bgCard: "rgba(13, 21, 37, 0.9)",
    text: "#F0F6FF",
    muted: "#8B9CB8",
    accent: "#00B4D8",        // Celeste Mundo
    accent2: "#0077A8",       // Azul Oscuro
    accent3: "#005A6F",       // Teal Oscuro
    accent4: "#10B981",       // Verde Éxito
    secondary: "#FDDC02",     // Amarillo Mundo
    border: "rgba(255,255,255,0.06)",
    glowCyan: "0 0 20px rgba(0,180,216,0.3), 0 0 40px rgba(0,180,216,0.1)",
    glowYellow: "0 0 20px rgba(253,220,2,0.3), 0 0 40px rgba(253,220,2,0.1)",
    gradientBar: "linear-gradient(180deg, #00B4D8 0%, #0077A8 100%)",
    sidebarBg: "rgba(13, 21, 37, 0.95)",
    headerBg: "rgba(9, 14, 26, 0.8)",
    inputBg: "rgba(255, 255, 255, 0.04)",
    sidebarText: "#F0F6FF",
    sidebarMuted: "#8B9CB8",
    headerText: "#F0F6FF",
    headerMuted: "#8B9CB8",
  },
  light: {
    bg: "#FFFFFF",
    bgGradient: "linear-gradient(135deg, #48CAE4 0%, #00B4D8 100%)",
    bgCard: "#FFFFFF",
    text: "#062F4F",          // Texto dentro de tarjetas blancas
    muted: "#4B6584",         // Muted dentro de tarjetas blancas
    accent: "#00B4D8",        // Celeste Mundo
    accent2: "#0077A8",       // Azul Oscuro
    accent3: "#005A6F",       // Teal Oscuro
    accent4: "#10B981",       // Verde Éxito
    secondary: "#FDDC02",     // Amarillo Mundo
    border: "rgba(0,116,142,0.12)",
    glowCyan: "0 0 20px rgba(0,180,216,0.3), 0 0 40px rgba(0,180,216,0.1)",
    glowYellow: "0 0 20px rgba(253,220,2,0.3), 0 0 40px rgba(253,220,2,0.1)",
    gradientBar: "linear-gradient(180deg, #00B4D8 0%, #0077A8 100%)",
    sidebarBg: "#005A6F",         // Celeste oscuro para que se vea el logo blanco
    headerBg: "rgba(0, 90, 111, 0.9)", // Celeste oscuro translúcido
    inputBg: "#F1F5F9",
    sidebarText: "#FFFFFF",       // Texto claro sobre celeste
    sidebarMuted: "rgba(255,255,255,0.65)",
    headerText: "#FFFFFF",        // Título del header claro
    headerMuted: "rgba(255,255,255,0.7)", // Muted del header claro
  },
};

function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const handler = (e) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);
  return matches;
}

export default function DashboardClient({ initialLeads, username }) {
  const [leads, setLeads] = useState(initialLeads);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [filter, setFilter] = useState("Todos");
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");
  const { theme: currentTheme, toggle: toggleTheme } = useTheme();
  const T = NEON_THEME[currentTheme];
  
  // Date filtering state
  const [selectedDateFilter, setSelectedDateFilter] = useState("todos");
  const [customDate, setCustomDate] = useState("");
  
  // Settings state (saved locally)
  const [sellerName, setSellerName] = useState("Valentina Asesora Mundo");
  const [sellerPhone, setSellerPhone] = useState("56912345678");
  const [sellerMsg, setSellerMsg] = useState("Hola Valentina, vi tu página web y me gustaría recibir asesoría sobre los planes de Internet y TV Hogar de Mundo.");
  const [sellerPhoto, setSellerPhoto] = useState("");
  const [sellerBio, setSellerBio] = useState("Como tu ejecutiva comercial especializada de Mundo, te ayudo a gestionar tu contrato de forma rápida y transparente.");
  const [landingTheme, setLandingTheme] = useState("light");
  const [footerText, setFooterText] = useState("Tu asesora comercial autorizada de Mundo. Gestión ágil, directa y transparente de tus planes de internet fibra, televisión digital y telefonía móvil.");
  const [whatsappNumber, setWhatsappNumber] = useState("56912345678");
  const [metaPixelId, setMetaPixelId] = useState("");
  const [bgVideoUrl, setBgVideoUrl] = useState("/bg-loop.mp4");
  const [toast, setToast] = useState(null);

  // Mensajes directos WhatsApp state
  const [clientSelectorOpen, setClientSelectorOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [clientSearch, setClientSearch] = useState("");
  const [whatsappMsg, setWhatsappMsg] = useState("");

  // Modo de envío: "single" (individual) o "mass" (en masa)
  const [waMode, setWaMode] = useState("single");

  // Estado para envío en masa
  const [bulkTemplate, setBulkTemplate] = useState(
    "Hola {{nombre}}, soy tu ejecutiva Mundo. Te escribo por tu consulta sobre el plan {{plan}} para {{ciudad}}. ¿Avanzamos con la factibilidad? Responde y lo gestiono."
  );
  const [bulkSelectedIds, setBulkSelectedIds] = useState([]);
  const [bulkStatusFilter, setBulkStatusFilter] = useState("Todos");
  const [bulkCityFilter, setBulkCityFilter] = useState("Todas");
  const [bulkSearch, setBulkSearch] = useState("");
  const [bulkPreviewId, setBulkPreviewId] = useState(null);
  const [bulkSending, setBulkSending] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ sent: 0, total: 0, current: null });
  const [bulkDelay, setBulkDelay] = useState(800);

  // Email masivo state
  const [emailTemplate, setEmailTemplate] = useState("default");
  const [emailSubject, setEmailSubject] = useState("Mundo · Información sobre {{plan}}");
  const [emailBody, setEmailBody] = useState("Hola {{nombre}},\n\nGracias por tu interés en Mundo. Te escribo para ayudarte con la factibilidad del plan {{plan}} en {{ciudad}}.\n\n¿Nos coordinamos para avanzar?\n\nSaludos,\nTu ejecutivo/a Mundo");
  const [emailSelectedIds, setEmailSelectedIds] = useState([]);
  const [emailStatusFilter, setEmailStatusFilter] = useState("Todos");
  const [emailCityFilter, setEmailCityFilter] = useState("Todas");
  const [emailSearch, setEmailSearch] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [emailProvider, setEmailProvider] = useState("gmail");
  const [emailSmtpHost, setEmailSmtpHost] = useState("");
  const [emailSmtpPort, setEmailSmtpPort] = useState("587");
  const [emailSmtpUser, setEmailSmtpUser] = useState("");
  const [emailSmtpPass, setEmailSmtpPass] = useState("");
  const [emailFrom, setEmailFrom] = useState("");
  const [emailUseSmtp, setEmailUseSmtp] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const p = localStorage.getItem("crm_email_provider"); if (p) setEmailProvider(p);
      const u = localStorage.getItem("crm_email_user"); if (u) setEmailSmtpUser(u);
      const f = localStorage.getItem("crm_email_from"); if (f) setEmailFrom(f);
      const h = localStorage.getItem("crm_email_host"); if (h) setEmailSmtpHost(h);
      const port = localStorage.getItem("crm_email_port"); if (port) setEmailSmtpPort(port);
      const s = localStorage.getItem("crm_email_use_smtp"); if (s) setEmailUseSmtp(s === "1");
    }
  }, []);

  const selectedLead = leads.find((l) => l.id === selectedClientId) || null;

  // Reemplaza placeholders del template con datos del cliente
  const renderTemplate = (template, lead) => {
    if (!lead) return template;
    return template
      .replace(/{{nombre}}/gi, lead.name || "")
      .replace(/{{telefono}}/gi, lead.phone || "")
      .replace(/{{email}}/gi, lead.email || "")
      .replace(/{{ciudad}}/gi, lead.city || "")
      .replace(/{{direccion}}/gi, lead.address || "")
      .replace(/{{plan}}/gi, lead.plan || "")
      .replace(/{{estado}}/gi, lead.status || "");
  };

  // Lista de ciudades únicas para filtro rápido
  const uniqueCities = useMemo(() => {
    const set = new Set(leads.map((l) => l.city).filter(Boolean));
    return ["Todas", ...Array.from(set).sort()];
  }, [leads]);

  // Lista filtrada para el multiselector en masa
  const bulkFilteredLeads = useMemo(() => {
    const q = bulkSearch.toLowerCase();
    return leads.filter((l) => {
      const matchesStatus = bulkStatusFilter === "Todos" || l.status === bulkStatusFilter;
      const matchesCity = bulkCityFilter === "Todas" || l.city === bulkCityFilter;
      const matchesSearch =
        !q ||
        l.name.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        l.city.toLowerCase().includes(q) ||
        l.plan.toLowerCase().includes(q);
      return matchesStatus && matchesCity && matchesSearch;
    });
  }, [leads, bulkStatusFilter, bulkCityFilter, bulkSearch]);

  const toggleBulkId = (id) => {
    setBulkSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAllBulkFiltered = () => {
    setBulkSelectedIds(bulkFilteredLeads.map((l) => l.id));
  };

  const clearBulkSelection = () => {
    setBulkSelectedIds([]);
    setBulkPreviewId(null);
  };

  const selectedBulkLeads = useMemo(
    () => leads.filter((l) => bulkSelectedIds.includes(l.id)),
    [leads, bulkSelectedIds]
  );

  const bulkPreviewLead = useMemo(
    () => leads.find((l) => l.id === bulkPreviewId) || selectedBulkLeads[0] || null,
    [leads, bulkPreviewId, selectedBulkLeads]
  );

  // Envío en masa: abre cada chat de WhatsApp secuencialmente con la plantilla personalizada
  const sendBulkWhatsApp = async () => {
    if (selectedBulkLeads.length === 0) return;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const baseUrl = isMobile ? "https://api.whatsapp.com/send" : "https://web.whatsapp.com/send";

    const confirm = window.confirm(
      `Vas a abrir ${selectedBulkLeads.length} conversaciones de WhatsApp personalizadas. Asegúrate de permitir pop-ups para este sitio. ¿Continuar?`
    );
    if (!confirm) return;

    setBulkSending(true);
    setBulkProgress({ sent: 0, total: selectedBulkLeads.length, current: null });
    let sent = 0;
    for (const lead of selectedBulkLeads) {
      setBulkProgress({ sent, total: selectedBulkLeads.length, current: lead });
      const phone = normalizeWhatsAppNumber(lead.phone).replace(/^56/, "");
      const text = renderTemplate(bulkTemplate, lead);
      const url = `${baseUrl}?phone=56${phone}&text=${encodeURIComponent(text)}`;
      window.open(url, "_blank");
      sent += 1;
      setBulkProgress({ sent, total: selectedBulkLeads.length, current: lead });
      await new Promise((r) => setTimeout(r, bulkDelay));
    }
    setBulkProgress({ sent, total: selectedBulkLeads.length, current: null });
    setBulkSending(false);
    showToast(`${sent} mensajes WhatsApp preparados en pestañas individuales`);
  };

  const copyBulkLinks = async () => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const baseUrl = isMobile ? "https://api.whatsapp.com/send" : "https://web.whatsapp.com/send";
    const lines = selectedBulkLeads.map((lead) => {
      const phone = normalizeWhatsAppNumber(lead.phone).replace(/^56/, "");
      const text = renderTemplate(bulkTemplate, lead);
      return `${lead.name} (+56 ${phone}): ${baseUrl}?phone=56${phone}&text=${encodeURIComponent(text)}`;
    });
    await navigator.clipboard.writeText(lines.join("\n"));
    showToast(`${lines.length} enlaces personalizados copiados al portapapeles`);
  };

  // Email masivo helpers
  const emailFilteredLeads = useMemo(() => {
    const q = emailSearch.toLowerCase();
    return leads.filter((l) => {
      const hasEmail = l.email && l.email.includes("@");
      const matchesStatus = emailStatusFilter === "Todos" || l.status === emailStatusFilter;
      const matchesCity = emailCityFilter === "Todas" || l.city === emailCityFilter;
      const matchesSearch = !q ||
        l.name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.city.toLowerCase().includes(q) ||
        l.plan.toLowerCase().includes(q);
      return hasEmail && matchesStatus && matchesCity && matchesSearch;
    });
  }, [leads, emailSearch, emailStatusFilter, emailCityFilter]);

  const toggleEmailId = (id) => setEmailSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const selectAllEmailFiltered = () => setEmailSelectedIds(emailFilteredLeads.map((l) => l.id));
  const clearEmailSelection = () => { setEmailSelectedIds([]); setBulkPreviewId(null); };
  const selectedEmailLeads = useMemo(() => leads.filter((l) => emailSelectedIds.includes(l.id)), [leads, emailSelectedIds]);

  const applyEmailTemplate = (key) => {
    setEmailTemplate(key);
    if (key === "default") {
      setEmailSubject("Mundo · Información sobre {{plan}}");
      setEmailBody("Hola {{nombre}},\n\nGracias por tu interés en Mundo. Te escribo para ayudarte con la factibilidad del plan {{plan}} en {{ciudad}}.\n\n¿Nos coordinamos para avanzar?\n\nSaludos,\nTu ejecutivo/a Mundo");
    } else if (key === "promo") {
      setEmailSubject("🔥 Oferta especial en {{plan}}");
      setEmailBody("Hola {{nombre}},\n\nTenemos una promoción especial esta semana para el plan {{plan}}.\n\nRespóndeme y revisamos factibilidad en tu sector ({{ciudad}}).\n\n¡Saludos!\nTu ejecutivo/a Mundo");
    } else if (key === "followup") {
      setEmailSubject("Mundo · Seguimiento de tu consulta");
      setEmailBody("Hola {{nombre}},\n\nTe escribo para dar seguimiento a tu consulta sobre el plan {{plan}} en {{ciudad}}.\n\n¿Tienes alguna duda? Estoy para ayudarte.\n\nSaludos,\nTu ejecutivo/a Mundo");
    }
  };

  const sendBulkEmail = async () => {
    if (selectedEmailLeads.length === 0) return;
    if (emailUseSmtp) {
      if (!confirm(`Vas a enviar ${selectedEmailLeads.length} correos reales por SMTP. ¿Continuar?`)) return;
      setEmailSending(true);
      let ok = 0, fail = 0;
      for (const lead of selectedEmailLeads) {
        const subj = renderTemplate(emailSubject, lead);
        const body = renderTemplate(emailBody, lead) + `\n\n— ${sellerName}`;
        try {
          const res = await fetch("/api/email/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: lead.email,
              subject: subj,
              body,
              fromName: sellerName,
              provider: emailProvider,
              host: emailSmtpHost,
              port: emailSmtpPort,
              user: emailSmtpUser,
              pass: emailSmtpPass,
              from: emailFrom,
            }),
          });
          if (res.ok) ok++; else fail++;
        } catch { fail++; }
      }
      setEmailSending(false);
      showToast(`${ok} correos enviados${fail ? `, ${fail} fallidos` : ""}`);
      return;
    }
    if (!confirm(`Vas a abrir ${selectedEmailLeads.length} correos en tu cliente. ¿Continuar?`)) return;
    for (const lead of selectedEmailLeads) {
      const subj = renderTemplate(emailSubject, lead);
      const body = renderTemplate(emailBody, lead) + `\n\n— ${sellerName}`;
      window.open(`mailto:${lead.email}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`, "_blank");
      await new Promise((r) => setTimeout(r, 400));
    }
    showToast(`${selectedEmailLeads.length} correos preparados`);
  };

  const copyEmailList = () => {
    const emails = selectedEmailLeads.map((l) => l.email).filter(Boolean).join(", ");
    navigator.clipboard.writeText(emails);
    showToast("Lista de correos copiada");
  };
  const filteredLeadsForSelector = useMemo(() => {
    const q = clientSearch.toLowerCase();
    return leads
      .filter((l) =>
        l.name.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        l.city.toLowerCase().includes(q)
      )
      .slice(0, 50);
  }, [leads, clientSearch]);

  const openClientSelector = () => {
    setClientSelectorOpen(!clientSelectorOpen);
  };

  const selectClient = (lead) => {
    setSelectedClientId(lead.id);
    setClientSelectorOpen(false);
    setClientSearch("");
    // Pre-fill message with default greeting + client name
    const phone = lead.phone.replace(/\D/g, "").slice(-9);
    const defaultGreeting = sellerMsg || "Hola, vi tu página web y me gustaría recibir asesoría sobre los planes de Internet y TV Hogar de Mundo.";
    setWhatsappMsg(`Hola ${lead.name}, ${defaultGreeting.toLowerCase().startsWith("hola") ? defaultGreeting.slice(5) : defaultGreeting}`);
  };

  const sendCustomWhatsApp = () => {
    if (!selectedLead || !whatsappMsg.trim()) return;
    const phone = normalizeWhatsAppNumber(selectedLead.phone).replace(/^56/, "");
    const encodedText = encodeURIComponent(whatsappMsg);
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const baseUrl = isMobile ? "https://api.whatsapp.com/send" : "https://web.whatsapp.com/send";
    const url = `${baseUrl}?phone=56${phone}&text=${encodedText}`;
    window.open(url, "_blank");
    showToast(`WhatsApp enviado a ${selectedLead.name}`);
  };

  // Importar datos Excel state
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const handleImportUpload = async () => {
    if (!importFile) return;
    setImporting(true);
    setImportResult(null);
    try {
      const formData = new FormData();
      formData.append("file", importFile);
      const res = await fetch("/api/leads/import", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setImportResult({ type: "error", message: data.error || "Error al importar" });
      } else {
        setImportResult({
          type: "success",
          message: `${data.imported} clientes importados correctamente${data.skipped > 0 ? ` (${data.skipped} filas omitidas)` : ""}`,
        });
        // Refresh leads
        const leadsRes = await fetch("/api/leads");
        if (leadsRes.ok) {
          const newLeads = await leadsRes.json();
          setLeads(newLeads);
        }
        setImportFile(null);
        showToast(`${data.imported} clientes importados exitosamente`);
      }
    } catch {
      setImportResult({ type: "error", message: "Error de conexión al subir el archivo" });
    } finally {
      setImporting(false);
    }
  };

  // Datos para gráficos de importación
  const importStats = useMemo(() => {
    const total = leads.length;
    const byStatus = {};
    STATUSES.forEach((s) => {
      byStatus[s] = leads.filter((l) => l.status === s).length;
    });
    const byCity = {};
    leads.forEach((l) => {
      byCity[l.city] = (byCity[l.city] || 0) + 1;
    });
    const topCities = Object.entries(byCity)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
    const byPlan = {};
    leads.forEach((l) => {
      const name = l.plan.split(" (")[0];
      byPlan[name] = (byPlan[name] || 0) + 1;
    });
    const topPlans = Object.entries(byPlan)
      .map(([name, value]) => ({ name, value: name === "Sin Plan" ? -value : value }))
      .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
      .slice(0, 5)
      .map((p) => ({ ...p, value: Math.abs(p.value) }));

    return { total, byStatus, topCities, topPlans };
  }, [leads]);
  
  const router = useRouter();

  // Load custom configurations on mount (DB first, localStorage fallback)
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        if (!res.ok) throw new Error("Failed to load settings");
        const settings = await res.json();

        if (settings.seller_name) setSellerName(settings.seller_name);
        if (settings.seller_phone) setSellerPhone(settings.seller_phone);
        if (settings.seller_msg) setSellerMsg(settings.seller_msg);
        if (settings.seller_photo) setSellerPhoto(settings.seller_photo);
        if (settings.seller_bio) setSellerBio(settings.seller_bio);
        if (settings.landing_theme) setLandingTheme(settings.landing_theme);
        if (settings.footer_text !== undefined) setFooterText(settings.footer_text);
        if (settings.whatsapp_number) setWhatsappNumber(normalizeWhatsAppNumber(settings.whatsapp_number));
        if (settings.meta_pixel_id !== undefined) setMetaPixelId(settings.meta_pixel_id);
        if (settings.bg_video_url !== undefined) setBgVideoUrl(settings.bg_video_url);
      } catch {
        // Fallback to localStorage if DB is unavailable
        if (typeof window !== "undefined") {
          const localName = localStorage.getItem("seller_name");
          const localPhone = localStorage.getItem("seller_phone");
          const localMsg = localStorage.getItem("seller_msg");
          const localPhoto = localStorage.getItem("seller_photo");
          const localBio = localStorage.getItem("seller_bio");
          if (localName) setSellerName(localName);
          if (localPhone) setSellerPhone(localPhone);
          if (localMsg) setSellerMsg(localMsg);
          if (localPhoto) setSellerPhoto(localPhoto);
          if (localBio) setSellerBio(localBio);
          const localLandingTheme = localStorage.getItem("landing_theme");
          if (localLandingTheme) setLandingTheme(localLandingTheme);
          const localFooter = localStorage.getItem("footer_text");
          if (localFooter) setFooterText(localFooter);
          const localWhatsapp = localStorage.getItem("whatsapp_number");
          if (localWhatsapp) setWhatsappNumber(normalizeWhatsAppNumber(localWhatsapp));
          const localPixel = localStorage.getItem("meta_pixel_id");
          if (localPixel) setMetaPixelId(localPixel);
          const localVideo = localStorage.getItem("bg_video_url");
          if (localVideo) setBgVideoUrl(localVideo);
        }
      }
    }
    loadSettings();
  }, []);

  // Auto-close sidebar on mobile
  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [isMobile]);

  // Close sidebar on mobile when navigating
  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [activeMenu, isMobile]);

  const saveSettings = async (e) => {
    e.preventDefault();
    const normalizedWhatsapp = normalizeWhatsAppNumber(whatsappNumber);

    const settings = {
      seller_name: sellerName,
      seller_phone: sellerPhone,
      seller_msg: sellerMsg,
      seller_bio: sellerBio,
      landing_theme: landingTheme,
      footer_text: footerText,
      whatsapp_number: normalizedWhatsapp,
      meta_pixel_id: metaPixelId.trim(),
      bg_video_url: bgVideoUrl.trim(),
      crm_email_provider: emailProvider,
      crm_email_user: emailSmtpUser,
      crm_email_from: emailFrom,
      crm_email_host: emailSmtpHost,
      crm_email_port: emailSmtpPort,
      crm_email_use_smtp: emailUseSmtp ? "1" : "0",
    };

    // Keep localStorage as local cache/backup
    Object.entries(settings).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
    document.documentElement.setAttribute("data-landing-theme", landingTheme);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Error al guardar en el servidor");
      showToast("Configuración guardada exitosamente");
    } catch (error) {
      showToast(error.message || "Error al guardar");
    }
  };

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "seller");

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Error al subir foto");

      setSellerPhoto(data.url);
      localStorage.setItem("seller_photo", data.url);
      showToast("Foto subida correctamente");
    } catch (err) {
      showToast(err.message || "Error al subir foto");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingVideo(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "videos");

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Error al subir video");

      setBgVideoUrl(data.url);
      localStorage.setItem("bg_video_url", data.url);
      showToast("Video de fondo subido correctamente");
    } catch (err) {
      showToast(err.message || "Error al subir video");
    } finally {
      setUploadingVideo(false);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Status updates
  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setLeads((prev) => prev.map((l) => (l.id === id ? updated : l)));
      showToast("Estado actualizado correctamente");
    } catch {
      alert("Error al actualizar estado");
    } finally {
      setUpdating(null);
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/dashboard/login");
  };

  // Date check helper
  const isSameDay = (d1, d2) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  // Filter leads by date and state
  const dateFilteredLeads = useMemo(() => {
    const now = new Date();
    return leads.filter((lead) => {
      const leadDate = new Date(lead.createdAt);
      
      if (selectedDateFilter === "hoy") {
        return isSameDay(leadDate, now);
      }
      if (selectedDateFilter === "ayer") {
        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);
        return isSameDay(leadDate, yesterday);
      }
      if (selectedDateFilter === "semana") {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        return leadDate >= oneWeekAgo;
      }
      if (selectedDateFilter === "mes") {
        const oneMonthAgo = new Date();
        oneMonthAgo.setDate(now.getDate() - 30);
        return leadDate >= oneMonthAgo;
      }
      if (selectedDateFilter === "custom" && customDate) {
        const selected = new Date(customDate + "T12:00:00");
        return isSameDay(leadDate, selected);
      }
      return true; // "todos"
    });
  }, [leads, selectedDateFilter, customDate]);

  // Apply search & status filter on top of date filtering
  const finalFilteredLeads = useMemo(() => {
    return dateFilteredLeads.filter((lead) => {
      const matchesStatus = filter === "Todos" || lead.status === filter;
      const q = search.toLowerCase();
      const matchesSearch =
        lead.name.toLowerCase().includes(q) ||
        lead.phone.includes(q) ||
        lead.city.toLowerCase().includes(q) ||
        lead.plan.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [dateFilteredLeads, filter, search]);

  // KPIs based on current date selection
  const kpis = useMemo(() => {
    const total = dateFilteredLeads.length;
    const nuevos = dateFilteredLeads.filter((l) => l.status === "Nuevo").length;
    const factibles = dateFilteredLeads.filter((l) => l.status === "Con Factibilidad").length;
    const sinFactibilidad = dateFilteredLeads.filter((l) => l.status === "Sin Factibilidad").length;
    const contactados = dateFilteredLeads.filter(
      (l) => l.status === "Contactado" || l.status === "En Proceso"
    ).length;
    return { total, nuevos, factibles, sinFactibilidad, contactados };
  }, [dateFilteredLeads]);

  // Counts for status bubbles
  const statusCounts = useMemo(() => {
    const counts = {};
    STATUSES.forEach((s) => (counts[s] = dateFilteredLeads.filter((l) => l.status === s).length));
    return counts;
  }, [dateFilteredLeads]);

  // Plan distribution counts (for charts)
  const planDistribution = useMemo(() => {
    const counts = {};
    dateFilteredLeads.forEach((l) => {
      const name = l.plan.split(" (")[0]; // clean up plan name
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [dateFilteredLeads]);

  // Daily intake timeline (last 10 days of the selection)
  const dailyIntakeData = useMemo(() => {
    const dates = {};
    const now = new Date();
    // Pre-fill last 10 days to make sure the chart is beautifully filled and continuous
    for (let i = 9; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toLocaleDateString("es-CL", { day: "2-digit", month: "short" });
      dates[dateStr] = 0;
    }

    leads.forEach((l) => {
      const dateStr = new Date(l.createdAt).toLocaleDateString("es-CL", { day: "2-digit", month: "short" });
      if (dates[dateStr] !== undefined) {
        dates[dateStr] += 1;
      }
    });

    return Object.entries(dates).map(([date, count]) => ({ date, count }));
  }, [leads]);

  // Generate bar chart layout
  const barChartLayout = useMemo(() => {
    if (dailyIntakeData.length === 0) return { items: [] };
    
    const maxVal = Math.max(...dailyIntakeData.map(d => d.count), 1);
    const width = 500;
    const height = 160;
    const paddingX = 30;
    const paddingY = 20;
    
    const barWidth = 30;
    const chartContentWidth = width - paddingX * 2;
    const barGap = dailyIntakeData.length > 1 ? chartContentWidth / (dailyIntakeData.length - 1) : 0;
    
    const items = dailyIntakeData.map((d, index) => {
      const x = paddingX + index * barGap;
      const barHeight = Math.max((d.count * (height - paddingY * 2)) / maxVal, 4);
      const y = height - paddingY - barHeight;
      return {
        x: x - barWidth / 2,
        y,
        barHeight,
        count: d.count,
        date: d.date,
        centerX: x,
      };
    });

    return { items, width, height, barWidth };
  }, [dailyIntakeData]);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: T.bgGradient,
        color: T.text,
        fontFamily: "'Inter', sans-serif",
        position: "relative",
        transition: "background 0.3s, color 0.3s",
      }}
    >
      {/* Toast Alert */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: isMobile ? "16px" : "24px",
            right: isMobile ? "16px" : "24px",
            left: isMobile ? "16px" : "auto",
            background: T.accent,
            color: T.bg,
            padding: isMobile ? "12px 16px" : "12px 24px",
            borderRadius: "10px",
            fontWeight: 800,
            fontSize: isMobile ? "13px" : "14px",
            boxShadow: T.glowCyan,
            zIndex: 1000,
            textAlign: isMobile ? "center" : "left",
          }}
        >
          {toast}
        </div>
      )}

      {/* Background Glows */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: `
            radial-gradient(ellipse 60% 40% at 50% 0%, rgba(0, 229, 255, 0.08) 0%, transparent 70%),
            radial-gradient(circle at 100% 100%, rgba(255, 45, 149, 0.05) 0%, transparent 50%)
          `,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ── MOBILE SIDEBAR BACKDROP ── */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 9,
          }}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside
        style={{
          width: sidebarOpen ? 280 : (isMobile ? 0 : 70),
          background: T.sidebarBg,
          backdropFilter: "blur(20px)",
          borderRight: isMobile ? "none" : `1px solid ${T.border}`,
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
          overflow: "hidden",
          position: isMobile ? "fixed" : "sticky",
          top: 0,
          left: 0,
          height: "100vh",
          zIndex: 10,
          boxShadow: isMobile && sidebarOpen ? "0 0 40px rgba(0,0,0,0.3)" : "none",
        }}
      >
        {/* Logo Section */}
        <div
          style={{
            padding: "24px 20px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
            minHeight: 80,
          }}
        >
          <img
            src="https://www.tumundo.cl/wp-content/uploads/2022/12/logo-mundo-negative.svg"
            alt="Mundo"
            style={{
              height: 32,
              width: "auto",
              filter: "brightness(1.2)",
            }}
          />
        </div>

        {/* User Info */}
        {sidebarOpen && (
          <div style={{ padding: "16px 20px", background: "rgba(255,255,255,0.05)", borderBottom: `1px solid ${T.border}` }}>
            <div style={{ fontSize: "11px", color: T.sidebarMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Asesor Comercial</div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", marginTop: 4 }}>{sellerName}</div>
          </div>
        )}

        {/* Nav Links */}
        <nav style={{ flex: 1, padding: "20px 10px", display: "flex", flexDirection: "column", gap: 6 }}>
          {[
            { id: "dashboard", icon: "bi-grid-1x2-fill", label: "Dashboard General" },
            { id: "leads", icon: "bi-people-fill", label: "Clientes y Leads" },
            { id: "emails", icon: "bi-envelope-fill", label: "Correos" },
            { id: "whatsapp", icon: "bi-whatsapp", label: "Mensajes Directos en Masa" },
            { id: "import", icon: "bi-file-earmark-spreadsheet-fill", label: "Importar Datos" },
            { id: "settings", icon: "bi-gear-fill", label: "Configuraciones" },
          ].map((item) => {
            const active = activeMenu === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 16px",
                  borderRadius: "12px",
                  cursor: "pointer",
                  background: active ? `${T.accent}20` : "transparent",
                  color: active ? T.accent : T.sidebarMuted,
                  border: active ? `1px solid ${T.accent}40` : "1px solid transparent",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                  fontWeight: 600,
                }}
              >
                <i className={`bi ${item.icon}`} style={{ fontSize: 16 }} />
                {sidebarOpen && <span>{item.label}</span>}
              </div>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div style={{ padding: "16px", borderTop: `1px solid ${T.border}`, display: "flex", flexDirection: "column", gap: 8 }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              padding: "8px",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.05)",
              border: "none",
              color: T.sidebarMuted,
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            <i className={`bi ${sidebarOpen ? "bi-arrow-bar-left" : "bi-arrow-bar-right"}`} />
          </button>
          {sidebarOpen && (
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                padding: "12px 16px",
                borderRadius: "12px",
                background: `linear-gradient(135deg, ${T.accent} 0%, ${T.accent2} 100%)`,
                border: "none",
                color: "#FFFFFF",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 700,
                transition: "all 0.2s",
                textDecoration: "none",
                boxShadow: T.glowCyan,
              }}
            >
              <i className="bi bi-globe-americas" />
              Ver Landing de Ventas
            </a>
          )}
          {sidebarOpen && (
            <button
              onClick={logout}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                padding: "12px 16px",
                borderRadius: "12px",
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                color: "#EF4444",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 700,
                transition: "all 0.2s",
              }}
            >
              <i className="bi bi-box-arrow-left" />
              Cerrar Sesión
            </button>
          )}
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, zIndex: 1 }}>
        {/* Top Header */}
        <header
          style={{
            background: T.headerBg,
            backdropFilter: "blur(20px)",
            borderBottom: `1px solid ${T.border}`,
            padding: isMobile ? "12px 16px" : "20px 40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(true)}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "none",
                  color: T.headerText,
                  width: 40,
                  height: 40,
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontSize: 20,
                  flexShrink: 0,
                }}
              >
                <i className="bi bi-list" />
              </button>
            )}
            <div>
              <h1 style={{ fontSize: isMobile ? "18px" : "24px", fontWeight: 800, color: T.headerText }}>
                {activeMenu === "dashboard" && "Dashboard"}
                {activeMenu === "leads" && "Clientes"}
                {activeMenu === "emails" && "Correos"}
                {activeMenu === "whatsapp" && "WhatsApp"}
                {activeMenu === "import" && "Importar Datos"}
                {activeMenu === "settings" && "Configuración"}
              </h1>
              {!isMobile && (
                <p style={{ fontSize: "13px", color: T.headerMuted, marginTop: 4 }}>
                  Administración y control de cobertura digital en tiempo real.
                </p>
              )}
            </div>
          </div>

          {/* Date filter - scrollable on mobile */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: "30px",
                border: `1px solid rgba(255,255,255,0.15)`,
                background: "rgba(255,255,255,0.08)",
                color: T.headerText,
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <i className={`bi ${currentTheme === "dark" ? "bi-sun-fill" : "bi-moon-fill"}`}></i>
              <span>{currentTheme === "dark" ? "Día" : "Noche"}</span>
            </button>

            {!isMobile && <span style={{ fontSize: "13px", color: T.headerMuted, fontWeight: 600 }}>Filtrar Fecha:</span>}
            <div style={{ display: "flex", background: "rgba(255,255,255,0.08)", padding: "4px", borderRadius: "10px", border: `1px solid rgba(255,255,255,0.15)`, overflowX: "auto", maxWidth: "100%" }}>
              {[
                { id: "todos", label: "Todo" },
                { id: "hoy", label: "Hoy" },
                { id: "ayer", label: "Ayer" },
                { id: "semana", label: "Semana" },
                { id: "mes", label: "Mes" },
                { id: "custom", label: "Otro" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedDateFilter(opt.id)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "8px",
                    border: "none",
                    background: selectedDateFilter === opt.id ? T.accent : "transparent",
                    color: selectedDateFilter === opt.id ? "#FFFFFF" : T.headerMuted,
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {selectedDateFilter === "custom" && (
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                style={{
                  background: T.bgCard,
                  border: `1px solid ${T.accent}50`,
                  color: T.text,
                  padding: "8px 12px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
            )}
          </div>
        </header>

        {/* Dashboard Grid */}
        <main style={{ padding: isMobile ? "16px" : "40px" }}>
          
          {/* ── MENU: DASHBOARD ── */}
          {activeMenu === "dashboard" && (
            <div>
              {/* Cards KPIs */}
              <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(${isMobile ? "140px" : "200px"}, 1fr))`, gap: isMobile ? 12 : 20, marginBottom: isMobile ? 24 : 40 }}>
                {[
                  { label: "Total Leads", value: kpis.total, icon: "bi-people-fill", color: T.accent },
                  { label: "Pendientes", value: kpis.nuevos, icon: "bi-star-fill", color: T.secondary },
                  { label: "En Gestión", value: kpis.contactados, icon: "bi-chat-right-text-fill", color: "#25D366" },
                  { label: "Factibles", value: kpis.factibles, icon: "bi-check-circle-fill", color: T.accent4 },
                ].map((kpi) => (
                  <div
                    key={kpi.label}
                    style={{
                      background: T.bgCard,
                      border: `1px solid ${T.border}`,
                      borderRadius: "20px",
                      padding: "24px",
                      boxShadow: `0 10px 30px rgba(0, 0, 0, 0.2)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      transition: "all 0.3s",
                    }}
                  >
                    <div>
                      <span style={{ fontSize: "12px", color: T.muted, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>
                        {kpi.label}
                      </span>
                      <div style={{ fontSize: "36px", fontWeight: 900, color: T.text, marginTop: 8 }}>{kpi.value}</div>
                    </div>
                    <div
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: "14px",
                        background: `${kpi.color}20`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: `1px solid ${kpi.color}40`,
                        boxShadow: `0 0 15px ${kpi.color}30`,
                      }}
                    >
                      <i className={`bi ${kpi.icon}`} style={{ color: kpi.color, fontSize: 20 }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Clean Bar Chart Section */}
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 16 : 30, marginBottom: 40 }}>
                {/* Neon Bar Chart */}
                <div
                  style={{
                    background: T.bgCard,
                    border: `1px solid ${T.border}`,
                    borderRadius: "24px",
                    padding: "30px",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: `0 0 30px rgba(0,229,255,0.05)`,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, color: T.accent, textShadow: `0 0 10px ${T.accent}40` }}>
                      <i className="bi bi-bar-chart-fill" style={{ marginRight: 6 }}></i>
                      Volumen Diario
                    </h3>
                  </div>
                  
                  <div style={{ position: "relative", width: "100%", height: "170px", marginTop: "10px" }}>
                    {barChartLayout.items.length > 0 && (
                      <svg
                        viewBox={`0 0 ${barChartLayout.width} ${barChartLayout.height}`}
                        style={{ width: "100%", height: "100%", overflow: "visible" }}
                      >
                        <defs>
                          {/* Neon glow filter */}
                          <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur1" />
                            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur2" />
                            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur3" />
                            <feMerge>
                              <feMergeNode in="blur3" />
                              <feMergeNode in="blur2" />
                              <feMergeNode in="blur1" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                          {/* Yellow glow for tallest bar */}
                          <filter id="neonGlowYellow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur1" />
                            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur2" />
                            <feGaussianBlur in="SourceGraphic" stdDeviation="16" result="blur3" />
                            <feMerge>
                              <feMergeNode in="blur3" />
                              <feMergeNode in="blur2" />
                              <feMergeNode in="blur1" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                          {/* Gradients for bars */}
                          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={T.accent} stopOpacity="1" />
                            <stop offset="50%" stopColor={T.accent} stopOpacity="0.7" />
                            <stop offset="100%" stopColor={T.accent2} stopOpacity="0.3" />
                          </linearGradient>
                          <linearGradient id="barGradYellow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={T.secondary} stopOpacity="1" />
                            <stop offset="50%" stopColor={T.secondary} stopOpacity="0.7" />
                            <stop offset="100%" stopColor="#D9A300" stopOpacity="0.3" />
                          </linearGradient>
                        </defs>

                        {/* Background grid lines */}
                        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
                          <line
                            key={ratio}
                            x1="30"
                            y1={barChartLayout.height - 20 - ratio * (barChartLayout.height - 40)}
                            x2={barChartLayout.width - 30}
                            y2={barChartLayout.height - 20 - ratio * (barChartLayout.height - 40)}
                            stroke={T.border}
                            strokeWidth="1"
                            strokeDasharray="4 4"
                          />
                        ))}

                        {/* Draw the Bars with Neon Effect */}
                        {barChartLayout.items.map((bar, i) => {
                          // Highlight tallest bar with pink glow
                          const maxCount = Math.max(...barChartLayout.items.map(b => b.count));
                          const isMax = bar.count === maxCount && maxCount > 0;
                          return (
                            <g key={i}>
                              {/* Glow behind bar */}
                                <rect
                                  x={bar.x - 2}
                                  y={bar.y - 2}
                                  width={barChartLayout.barWidth + 4}
                                  height={bar.barHeight + 4}
                                  rx="8"
                                  ry="8"
                                  fill={isMax ? T.secondary : T.accent}
                                  opacity="0.3"
                                  filter={`url(${isMax ? "#neonGlowYellow" : "#neonGlow"})`}
                                />
                                {/* Main bar */}
                                <rect
                                  x={bar.x}
                                  y={bar.y}
                                  width={barChartLayout.barWidth}
                                  height={bar.barHeight}
                                  rx="6"
                                  ry="6"
                                  fill={`url(${isMax ? "#barGradYellow" : "#barGrad"})`}
                                  style={{
                                    transition: "all 0.3s",
                                    cursor: "pointer",
                                    animation: "none",
                                  }}
                                />
                                {/* Count on top */}
                                <text
                                  x={bar.centerX}
                                  y={bar.y - 10}
                                  fill={isMax ? T.secondary : T.text}
                                  fontSize="12px"
                                  fontWeight="900"
                                  textAnchor="middle"
                                  filter={isMax ? "url(#neonGlowYellow)" : "none"}
                                >
                                  {bar.count}
                                </text>
                              {/* Shine reflection line */}
                              <rect
                                x={bar.x + 4}
                                y={bar.y + 4}
                                width="4"
                                height={Math.min(bar.barHeight * 0.4, 20)}
                                rx="2"
                                fill="rgba(255,255,255,0.2)"
                              />
                            </g>
                          );
                        })}
                      </svg>
                    )}
                  </div>
                  
                  {/* X Axis Labels */}
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "0 15px", marginTop: "10px" }}>
                    {dailyIntakeData.map((d, i) => (
                      <span key={d.date} style={{ fontSize: "10px", color: T.muted, fontWeight: 700, letterSpacing: "0.02em" }}>
                        {i % 2 === 0 || dailyIntakeData.length < 8 ? d.date : ""}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Plan Distribution - now with neon accents */}
                <div
                  style={{
                    background: T.bgCard,
                    border: `1px solid ${T.border}`,
                    borderRadius: "24px",
                    padding: "30px",
                    boxShadow: `0 0 30px rgba(176,38,255,0.05)`,
                  }}
                >
                  <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: 20, color: T.accent, textShadow: `0 0 10px ${T.accent}40` }}>
                    <i className="bi bi-pie-chart-fill" style={{ marginRight: 6 }}></i>
                    Planes Más Solicitados
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {planDistribution.slice(0, 4).map((p, i) => {
                      const total = planDistribution.reduce((acc, curr) => acc + curr.value, 0);
                      const percentage = total > 0 ? ((p.value / total) * 100).toFixed(0) : 0;
                      const barColors = [T.accent, T.accent2, T.secondary, T.accent3];
                      return (
                        <div key={p.name} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                            <span style={{ fontWeight: 600, color: T.text }}>{p.name}</span>
                            <span style={{ fontWeight: 700, color: barColors[i] }}>{p.value} ({percentage}%)</span>
                          </div>
                          <div style={{ height: "10px", background: T.inputBg, borderRadius: "6px", overflow: "hidden", position: "relative" }}>
                            <div style={{
                              width: `${percentage}%`,
                              height: "100%",
                              background: `linear-gradient(90deg, ${barColors[i]}, ${i < 3 ? T.accent : barColors[i]})`,
                              borderRadius: "6px",
                              boxShadow: `0 0 10px ${barColors[i]}60`,
                              transition: "width 1s ease",
                            }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>


              {/* Recent Leads Table */}
              <div
                style={{
                  background: T.bgCard,
                  border: `1px solid ${T.border}`,
                  borderRadius: "24px",
                  padding: "30px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: T.accent }}>Leads Recientes</h3>
                  <button
                    onClick={() => setActiveMenu("leads")}
                    style={{ background: "transparent", border: "none", color: T.secondary, fontWeight: 700, fontSize: "13px", cursor: "pointer" }}
                  >
                    Ver todos los leads →
                  </button>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                        {["Fecha", "Cliente", "Teléfono", "Comuna", "Plan", "Estado"].map((h) => (
                          <th key={h} style={{ padding: "10px 16px", fontSize: "11px", fontWeight: 800, color: T.muted, textTransform: "uppercase" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {finalFilteredLeads.slice(0, 5).map((l) => (
                        <tr key={l.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                          <td style={{ padding: "12px 16px", fontSize: "13px", color: T.text }}>
                            {new Date(l.createdAt).toLocaleDateString("es-CL")}
                          </td>
                          <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: 700, color: T.text }}>{l.name}</td>
                          <td style={{ padding: "12px 16px", fontSize: "13px", color: T.text }}>{l.phone}</td>
                          <td style={{ padding: "12px 16px", fontSize: "13px", color: T.muted }}>{l.city}</td>
                          <td style={{ padding: "12px 16px", fontSize: "12px" }}>
                            <span style={{ padding: "3px 8px", borderRadius: "6px", background: `${T.accent}20`, color: T.accent, fontWeight: 600 }}>{l.plan}</span>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{ fontSize: "11px", fontWeight: 800, padding: "3px 8px", borderRadius: "10px", background: STATUS_CONFIG[l.status]?.bg, color: STATUS_CONFIG[l.status]?.text }}>
                              {l.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── MENU: LEADS LIST ── */}
          {activeMenu === "leads" && (
            <div
              style={{
                background: T.bgCard,
                border: `1px solid ${T.border}`,
                borderRadius: "24px",
                padding: isMobile ? "16px" : "30px",
                boxShadow: "0 20px 50px rgba(0, 0, 0, 0.3)",
              }}
            >
              {/* Filter bar */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: isMobile ? 16 : 30, alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {["Todos", ...STATUSES].map((status) => {
                    const active = filter === status;
                    return (
                      <button
                        key={status}
                        onClick={() => setFilter(status)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "10px",
                          fontSize: isMobile ? "11px" : "13px",
                          fontWeight: 700,
                          cursor: "pointer",
                          border: `1px solid ${T.border}`,
                          background: active ? T.accent : "rgba(255,255,255,0.03)",
                          color: active ? T.bg : T.muted,
                          transition: "all 0.2s",
                        }}
                      >
                        {status}
                      </button>
                    );
                  })}
                </div>

                {/* Search input */}
                <div style={{ position: "relative", minWidth: isMobile ? "100%" : 280 }}>
                  <i className="bi bi-search" style={{ position: "absolute", left: 14, top: 12, color: T.muted }} />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, comuna o plan..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 16px 10px 40px",
                      borderRadius: "10px",
                      background: T.inputBg,
                      border: `1px solid ${T.border}`,
                      color: T.text,
                      fontSize: "13px",
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              {/* Leads Table */}
              {finalFilteredLeads.length === 0 ? (
                <div style={{ padding: "60px 0", textAlign: "center", color: T.muted }}>
                  <i className="bi bi-inbox" style={{ fontSize: 40, color: T.muted, opacity: 0.5 }} />
                  <p style={{ marginTop: 16, fontWeight: 700 }}>No se encontraron leads para esta búsqueda.</p>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                        {isMobile
                          ? ["Cliente", "Estado"].map((h) => (
                              <th key={h} style={{ padding: "10px 12px", fontSize: "11px", fontWeight: 800, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                {h}
                              </th>
                            ))
                          : ["Fecha", "Cliente", "Teléfono", "Email", "Ciudad/Comuna", "Dirección", "Plan Solicitado", "Acción/Estado"].map((h) => (
                              <th key={h} style={{ padding: "14px 20px", fontSize: "11px", fontWeight: 800, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                {h}
                              </th>
                            ))}
                      </tr>
                    </thead>
                    <tbody>
                      {finalFilteredLeads.map((lead) => {
                        const statusIcons = (
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {STATUSES.map((s) => {
                              const sc = STATUS_CONFIG[s];
                              const isActive = lead.status === s;
                              return (
                                <button
                                  key={s}
                                  title={s}
                                  onClick={() => updateStatus(lead.id, s)}
                                  disabled={updating === lead.id}
                                  style={{
                                    width: isMobile ? 38 : 24,
                                    height: isMobile ? 38 : 24,
                                    borderRadius: isMobile ? "10px" : "7px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    border: isActive ? "none" : `1px solid ${T.border}`,
                                    background: isActive ? sc.bg : "transparent",
                                    color: isActive ? sc.text : T.muted,
                                    fontSize: isMobile ? 16 : 11,
                                    transition: "all 0.15s",
                                    opacity: isActive ? 1 : 0.55,
                                  }}
                                >
                                  <i className={`bi ${sc.icon}`}></i>
                                </button>
                              );
                            })}
                          </div>
                        );
                        return isMobile ? (
                          <tr key={lead.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                            <td style={{ padding: "12px" }}>
                              <div style={{ fontSize: "14px", fontWeight: 700, color: T.text, marginBottom: 4 }}>{lead.name}</div>
                              <a
                                href={`https://wa.me/56${lead.phone.replace(/\D/g, "").slice(-9)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "12px", fontWeight: 600, color: "#25D366", marginBottom: 8 }}
                              >
                                <i className="bi bi-whatsapp" /> +56 {lead.phone}
                              </a>
                              <div style={{ fontSize: "11px", color: T.muted }}>
                                {lead.plan} · {lead.city}
                              </div>
                            </td>
                            <td style={{ padding: "12px", verticalAlign: "top" }}>
                              {statusIcons}
                            </td>
                          </tr>
                        ) : (
                          <tr key={lead.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                            <td style={{ padding: "20px" }}>
                              <div style={{ fontSize: "13px", fontWeight: 700 }}>
                                {new Date(lead.createdAt).toLocaleDateString("es-CL", { day: "2-digit", month: "short" })}
                              </div>
                              <div style={{ fontSize: "11px", color: "#8B9CB8", marginTop: 2 }}>
                                {new Date(lead.createdAt).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}
                              </div>
                            </td>
                            <td style={{ padding: "20px", fontSize: "14px", fontWeight: 700, color: T.text }}>{lead.name}</td>
                            <td style={{ padding: "20px" }}>
                              <a
                                href={`https://wa.me/56${lead.phone.replace(/\D/g, "").slice(-9)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 6,
                                  fontSize: "13px",
                                  fontWeight: 700,
                                  color: "#25D366",
                                }}
                              >
                                <i className="bi bi-whatsapp" /> +56 {lead.phone}
                              </a>
                            </td>
                            <td style={{ padding: "20px", fontSize: "13px", color: T.text }}>{lead.email || <span style={{ color: T.muted, fontStyle: "italic" }}>—</span>}</td>
                            <td style={{ padding: "20px", fontSize: "13px", color: "#8B9CB8" }}>{lead.city}</td>
                            <td style={{ padding: "20px", fontSize: "13px", color: T.muted, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lead.address}</td>
                            <td style={{ padding: "20px" }}>
                              <span style={{ fontSize: "12px", fontWeight: 700, padding: "4px 10px", borderRadius: "8px", background: `${T.accent}20`, color: T.accent }}>
                                {lead.plan}
                              </span>
                            </td>
                            <td style={{ padding: "20px" }}>
                              {statusIcons}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── MENU: EMAILS ── */}
          {activeMenu === "emails" && (
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 360px", gap: isMobile ? 16 : 24 }}>
              <div
                style={{
                  background: T.bgCard,
                  border: `1px solid ${T.border}`,
                  borderRadius: "24px",
                  padding: isMobile ? "20px" : "30px",
                  boxShadow: "0 20px 50px rgba(0, 0, 0, 0.3)",
                }}
              >
                <h2 style={{ fontSize: "20px", fontWeight: 800, color: T.accent, marginBottom: 6 }}>
                  <i className="bi bi-envelope-fill" style={{ marginRight: 8 }} /> Correo Masivo a Clientes
                </h2>
                <p style={{ fontSize: "13px", color: T.muted, marginBottom: 24 }}>
                  Selecciona leads con email y envía mensajes personalizados por WhatsApp Web o SMTP.
                </p>

                {/* Plantillas */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Plantilla</label>
                  <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                    {[
                      { key: "default", label: "Estándar" },
                      { key: "promo", label: "Promo" },
                      { key: "followup", label: "Seguimiento" },
                    ].map((t) => (
                      <button
                        key={t.key}
                        onClick={() => applyEmailTemplate(t.key)}
                        style={{
                          padding: "7px 14px", borderRadius: "9px", fontSize: 13, fontWeight: 700, cursor: "pointer",
                          border: `1px solid ${emailTemplate === t.key ? T.accent : T.border}`,
                          background: emailTemplate === t.key ? T.accent : "transparent",
                          color: emailTemplate === t.key ? T.bg : T.muted,
                        }}
                      >{t.label}</button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Asunto</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    style={{
                      width: "100%", marginTop: 8, padding: "10px 14px", borderRadius: "10px",
                      background: T.inputBg, border: `1px solid ${T.border}`, color: T.text, fontSize: 13, outline: "none",
                    }}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Cuerpo</label>
                  <textarea
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    rows={7}
                    style={{
                      width: "100%", marginTop: 8, padding: "12px 14px", borderRadius: "10px",
                      background: T.inputBg, border: `1px solid ${T.border}`, color: T.text, fontSize: 13,
                      fontFamily: "inherit", resize: "vertical", outline: "none",
                    }}
                  />
                  <div style={{ fontSize: "11px", color: T.muted, marginTop: 6 }}>
                    Variables: <code style={{ color: T.accent }}>{`{{nombre}} {{telefono}} {{email}} {{ciudad}} {{direccion}} {{plan}} {{estado}}`}</code>
                  </div>
                </div>

                {/* Modo envío */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 14, padding: "10px 12px", borderRadius: "10px", background: T.inputBg, border: `1px solid ${T.border}` }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>Modo envío:</span>
                  <button onClick={() => setEmailUseSmtp(false)} style={{ padding: "6px 12px", borderRadius: "8px", fontSize: 12, fontWeight: 700, cursor: "pointer", border: `1px solid ${!emailUseSmtp ? T.accent : T.border}`, background: !emailUseSmtp ? T.accent : "transparent", color: !emailUseSmtp ? T.bg : T.muted }}>Mailto</button>
                  <button onClick={() => setEmailUseSmtp(true)} style={{ padding: "6px 12px", borderRadius: "8px", fontSize: 12, fontWeight: 700, cursor: "pointer", border: `1px solid ${emailUseSmtp ? T.accent : T.border}`, background: emailUseSmtp ? T.accent : "transparent", color: emailUseSmtp ? T.bg : T.muted }}>SMTP corporativo</button>
                </div>

                {/* Config SMTP */}
                {emailUseSmtp && (
                  <div style={{ marginBottom: 18, padding: 16, borderRadius: "12px", background: T.inputBg, border: `1px solid ${T.border}` }}>
                    <label style={{ fontSize: "11px", fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Proveedor</label>
                    <select
                      value={emailProvider}
                      onChange={(e) => setEmailProvider(e.target.value)}
                      style={{ width: "100%", marginTop: 6, marginBottom: 12, padding: "9px 12px", borderRadius: "8px", background: T.bgCard, border: `1px solid ${T.border}`, color: T.text, fontSize: 13 }}
                    >
                      <option value="gmail">Gmail</option>
                      <option value="outlook">Outlook / Microsoft 365</option>
                      <option value="yahoo">Yahoo Mail</option>
                      <option value="zoho">Zoho Mail</option>
                      <option value="custom">SMTP personalizado</option>
                    </select>
                    {emailProvider === "custom" && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                        <input type="text" placeholder="Host SMTP" value={emailSmtpHost} onChange={(e) => setEmailSmtpHost(e.target.value)} style={{ padding: "9px 12px", borderRadius: "8px", background: T.bgCard, border: `1px solid ${T.border}`, color: T.text, fontSize: 13 }} />
                        <input type="text" placeholder="Puerto" value={emailSmtpPort} onChange={(e) => setEmailSmtpPort(e.target.value)} style={{ padding: "9px 12px", borderRadius: "8px", background: T.bgCard, border: `1px solid ${T.border}`, color: T.text, fontSize: 13 }} />
                      </div>
                    )}
                    <input type="email" placeholder="Usuario / Email" value={emailSmtpUser} onChange={(e) => setEmailSmtpUser(e.target.value)} style={{ width: "100%", marginBottom: 10, padding: "9px 12px", borderRadius: "8px", background: T.bgCard, border: `1px solid ${T.border}`, color: T.text, fontSize: 13 }} />
                    <input type="password" placeholder="Contraseña o clave de app" value={emailSmtpPass} onChange={(e) => setEmailSmtpPass(e.target.value)} style={{ width: "100%", marginBottom: 10, padding: "9px 12px", borderRadius: "8px", background: T.bgCard, border: `1px solid ${T.border}`, color: T.text, fontSize: 13 }} />
                    <input type="email" placeholder="Email remitente" value={emailFrom} onChange={(e) => setEmailFrom(e.target.value)} style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", background: T.bgCard, border: `1px solid ${T.border}`, color: T.text, fontSize: 13 }} />
                    <p style={{ fontSize: 11, color: T.muted, marginTop: 10, lineHeight: 1.5 }}>
                      Guarda la configuración en Configuraciones. Para Gmail usa una <b>contraseña de aplicación</b>.
                    </p>
                  </div>
                )}

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button onClick={sendBulkEmail} disabled={emailSending || selectedEmailLeads.length === 0} style={{
                    padding: "10px 20px", borderRadius: "10px", border: "none", cursor: emailSending || selectedEmailLeads.length === 0 ? "not-allowed" : "pointer",
                    background: emailSending || selectedEmailLeads.length === 0 ? "rgba(255,255,255,0.06)" : T.accent,
                    color: emailSending || selectedEmailLeads.length === 0 ? T.muted : T.bg,
                    fontWeight: 800, fontSize: 13, display: "inline-flex", alignItems: "center", gap: 8, boxShadow: emailSending || selectedEmailLeads.length === 0 ? "none" : T.glowCyan,
                  }}>
                    <i className="bi bi-send-fill" /> {emailSending ? "Enviando..." : `Enviar a ${selectedEmailLeads.length}`}
                  </button>
                  <button onClick={copyEmailList} disabled={selectedEmailLeads.length === 0} style={{
                    padding: "10px 20px", borderRadius: "10px", border: `1px solid ${T.border}`, background: "transparent", color: T.text,
                    fontWeight: 700, fontSize: 13, cursor: selectedEmailLeads.length === 0 ? "not-allowed" : "pointer",
                  }}>Copiar lista</button>
                </div>
              </div>

              {/* Selector de leads con email */}
              <div
                style={{
                  background: T.bgCard,
                  border: `1px solid ${T.border}`,
                  borderRadius: "24px",
                  padding: isMobile ? "20px" : "24px",
                  boxShadow: "0 20px 50px rgba(0, 0, 0, 0.3)",
                  height: "fit-content",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: T.accent }}><i className="bi bi-people-fill" style={{ marginRight: 6 }} /> Destinatarios</h3>
                  <span style={{ fontSize: 12, color: T.muted, fontWeight: 700 }}>{emailSelectedIds.length}/{emailFilteredLeads.length}</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={emailSearch}
                    onChange={(e) => setEmailSearch(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "10px", background: T.inputBg, border: `1px solid ${T.border}`, color: T.text, fontSize: 13, outline: "none" }}
                  />
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <select value={emailStatusFilter} onChange={(e) => setEmailStatusFilter(e.target.value)} style={{ flex: 1, minWidth: 100, padding: "7px 10px", borderRadius: "8px", background: T.inputBg, border: `1px solid ${T.border}`, color: T.text, fontSize: 12 }}>
                      <option value="Todos">Todos los estados</option>
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select value={emailCityFilter} onChange={(e) => setEmailCityFilter(e.target.value)} style={{ flex: 1, minWidth: 100, padding: "7px 10px", borderRadius: "8px", background: T.inputBg, border: `1px solid ${T.border}`, color: T.text, fontSize: 12 }}>
                      <option value="Todas">Todas las ciudades</option>
                      {uniqueCities.filter((c) => c !== "Todas").map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={selectAllEmailFiltered} style={{ flex: 1, padding: "7px", borderRadius: "8px", border: `1px solid ${T.border}`, background: "transparent", color: T.muted, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Todos</button>
                    <button onClick={clearEmailSelection} style={{ flex: 1, padding: "7px", borderRadius: "8px", border: `1px solid ${T.border}`, background: "transparent", color: T.muted, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Limpiar</button>
                  </div>
                </div>

                <div style={{ maxHeight: 450, overflowY: "auto", border: `1px solid ${T.border}`, borderRadius: "12px" }}>
                  {emailFilteredLeads.length === 0 ? (
                    <div style={{ padding: "30px 0", textAlign: "center", color: T.muted }}>
                      <i className="bi bi-inbox" style={{ fontSize: 28, opacity: 0.5 }} />
                      <p style={{ marginTop: 10, fontSize: 12, fontWeight: 700 }}>No hay leads con email.</p>
                    </div>
                  ) : emailFilteredLeads.map((lead) => {
                    const checked = emailSelectedIds.includes(lead.id);
                    return (
                      <div key={lead.id} onClick={() => toggleEmailId(lead.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderBottom: `1px solid ${T.border}`, background: checked ? `${T.accent}10` : "transparent", cursor: "pointer" }}>
                        <input type="checkbox" checked={checked} readOnly style={{ accentColor: T.accent, width: 16, height: 16 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{lead.name}</div>
                          <div style={{ fontSize: 11, color: T.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lead.email}</div>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 700, color: T.muted }}>{lead.city}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── MENU: SETTINGS ── */}
          {activeMenu === "settings" && (
            <div
              style={{
                background: T.bgCard,
                border: `1px solid ${T.border}`,
                borderRadius: "24px",
                padding: isMobile ? "20px" : "40px",
                boxShadow: "0 20px 50px rgba(0, 0, 0, 0.3)",
                maxWidth: "650px",
                margin: "0 auto",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 6 }}>
                <h2 style={{ fontSize: "20px", fontWeight: 800, color: T.accent, margin: 0 }}>
                  <i className="bi bi-person-badge-fill" style={{ marginRight: 8 }}></i>
                  Presentación del Vendedor
                </h2>
                <a
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 16px",
                    borderRadius: "10px",
                    background: `linear-gradient(135deg, ${T.accent} 0%, ${T.accent2} 100%)`,
                    color: "#FFFFFF",
                    fontWeight: 700,
                    fontSize: "13px",
                    textDecoration: "none",
                    boxShadow: T.glowCyan,
                    transition: "all 0.2s",
                  }}
                >
                  <i className="bi bi-eye-fill"></i>
                  Ver en la Landing
                </a>
              </div>
              <p style={{ fontSize: "13px", color: T.muted, marginBottom: 30 }}>
                Personaliza la foto, nombre, contacto y texto que se muestra automáticamente en la landing page de ventas.
              </p>

              <form onSubmit={saveSettings} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* Photo Upload */}
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                    Foto del Vendedor
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{
                      width: 80,
                      height: 80,
                      borderRadius: "16px",
                      overflow: "hidden",
                      background: "rgba(255,255,255,0.05)",
                      border: `1px solid ${T.border}`,
                      flexShrink: 0,
                    }}>
                      {sellerPhoto ? (
                        <img src={sellerPhoto} alt="Vendedor" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: T.muted, fontSize: 24 }}>
                          <i className="bi bi-person-fill" />
                        </div>
                      )}
                    </div>
                    <label style={{
                      padding: "8px 16px",
                      borderRadius: "10px",
                      background: uploadingPhoto ? "rgba(255,255,255,0.06)" : `${T.accent}20`,
                      border: `1px solid ${T.accent}40`,
                      color: uploadingPhoto ? T.muted : T.accent,
                      fontWeight: 700,
                      fontSize: "13px",
                      cursor: uploadingPhoto ? "not-allowed" : "pointer",
                      transition: "all 0.2s",
                    }}>
                      <i className={`bi ${uploadingPhoto ? "bi-arrow-clockwise" : "bi-upload"}`} style={{ marginRight: 6 }}></i>
                      {uploadingPhoto ? "Subiendo..." : "Subir Foto"}
                      <input type="file" accept="image/*" disabled={uploadingPhoto} onChange={handlePhotoUpload} style={{ display: "none" }} />
                    </label>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                    Nombre del Ejecutivo/a
                  </label>
                  <input
                    type="text"
                    value={sellerName}
                    onChange={(e) => setSellerName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      background: T.inputBg,
                      border: `1px solid ${T.border}`,
                      borderRadius: "12px",
                      color: T.text,
                      fontSize: "14px",
                      outline: "none",
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                    Texto de Presentación
                  </label>
                  <textarea
                    value={sellerBio}
                    onChange={(e) => setSellerBio(e.target.value)}
                    rows={4}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      background: T.inputBg,
                      border: `1px solid ${T.border}`,
                      borderRadius: "12px",
                      color: T.text,
                      fontSize: "14px",
                      outline: "none",
                      resize: "none",
                      lineHeight: "1.5",
                    }}
                    required
                  />
                  <span style={{ fontSize: "11px", color: T.muted, marginTop: 4, display: "block" }}>
                    Este texto se muestra en la sección del vendedor en la landing page.
                  </span>
                </div>

                <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 20 }}>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                    Teléfono WhatsApp (Formato Chile 569...)
                  </label>
                  <input
                    type="text"
                    value={sellerPhone}
                    onChange={(e) => setSellerPhone(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      background: T.inputBg,
                      border: `1px solid ${T.border}`,
                      borderRadius: "12px",
                      color: T.text,
                      fontSize: "14px",
                      outline: "none",
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                    Mensaje Inicial por Defecto (WhatsApp)
                  </label>
                  <textarea
                    value={sellerMsg}
                    onChange={(e) => setSellerMsg(e.target.value)}
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      background: T.inputBg,
                      border: `1px solid ${T.border}`,
                      borderRadius: "12px",
                      color: T.text,
                      fontSize: "14px",
                      outline: "none",
                      resize: "none",
                      lineHeight: "1.5",
                    }}
                    required
                  />
                </div>

                {/* Separador */}
                <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 20, marginTop: 4 }}>
                  <h3 style={{ fontSize: "15px", fontWeight: 800, color: T.accent, marginBottom: 12 }}>
                    <i className="bi bi-palette-fill" style={{ marginRight: 6 }}></i>
                    Apariencia de la Landing
                  </h3>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                    Modo de vista (Día / Noche)
                  </label>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => setLandingTheme("light")}
                      style={{
                        flex: 1,
                        padding: "12px",
                        borderRadius: "12px",
                        border: landingTheme === "light" ? `2px solid ${T.accent}` : `1px solid ${T.border}`,
                        background: landingTheme === "light" ? `${T.accent}15` : "transparent",
                        color: landingTheme === "light" ? T.accent : T.muted,
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        transition: "all 0.2s",
                      }}
                    >
                      <i className="bi bi-sun-fill"></i> Día
                    </button>
                    <button
                      type="button"
                      onClick={() => setLandingTheme("dark")}
                      style={{
                        flex: 1,
                        padding: "12px",
                        borderRadius: "12px",
                        border: landingTheme === "dark" ? `2px solid ${T.accent}` : `1px solid ${T.border}`,
                        background: landingTheme === "dark" ? `${T.accent}15` : "transparent",
                        color: landingTheme === "dark" ? T.accent : T.muted,
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        transition: "all 0.2s",
                      }}
                    >
                      <i className="bi bi-moon-stars-fill"></i> Noche
                    </button>
                  </div>
                  <span style={{ fontSize: "11px", color: T.muted, marginTop: 6, display: "block" }}>
                    Controla si la landing de ventas se ve en modo claro u oscuro.
                  </span>
                </div>

                {/* WhatsApp QR / Numero */}
                <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 20, marginTop: 4 }}>
                  <h3 style={{ fontSize: "15px", fontWeight: 800, color: T.accent, marginBottom: 12 }}>
                    <i className="bi bi-qr-code-scan" style={{ marginRight: 6 }}></i>
                    WhatsApp de Recepción de Leads
                  </h3>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                    Número de WhatsApp (Formato Chile 569...)
                  </label>
                  <input
                    type="text"
                    inputMode="tel"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ""))}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      background: T.inputBg,
                      border: `1px solid ${T.border}`,
                      borderRadius: "12px",
                      color: T.text,
                      fontSize: "14px",
                      outline: "none",
                    }}
                    placeholder="Ej: 56912345678"
                    required
                  />
                  <span style={{ fontSize: "11px", color: T.muted, marginTop: 6, display: "block" }}>
                    Los leads que lleguen desde la landing se enviarán a este WhatsApp automáticamente.
                  </span>
                  {/* Vista previa QR */}
                  <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent("https://wa.me/" + normalizeWhatsAppNumber(whatsappNumber))}`}
                      alt="QR WhatsApp"
                      style={{ borderRadius: "14px", width: 180, height: 180 }}
                    />
                  </div>
                  <span style={{ fontSize: "11px", color: T.muted, marginTop: 6, display: "block", textAlign: "center" }}>
                    Código QR generado para {normalizeWhatsAppNumber(whatsappNumber) || "—"}.
                  </span>
                </div>

                {/* Texto del footer */}
                <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 20, marginTop: 4 }}>
                  <h3 style={{ fontSize: "15px", fontWeight: 800, color: T.accent, marginBottom: 12 }}>
                    <i className="bi bi-text-left" style={{ marginRight: 6 }}></i>
                    Texto del Footer (Abajo de la Landing)
                  </h3>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                    Mensaje de Presentación / Despedida
                  </label>
                  <textarea
                    value={footerText}
                    onChange={(e) => setFooterText(e.target.value)}
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      background: T.inputBg,
                      border: `1px solid ${T.border}`,
                      borderRadius: "12px",
                      color: T.text,
                      fontSize: "14px",
                      outline: "none",
                      resize: "vertical",
                      lineHeight: "1.5",
                      fontFamily: "inherit",
                    }}
                    required
                  />
<span style={{ fontSize: "11px", color: T.muted, marginTop: 6, display: "block" }}>
                    Este texto aparece abajo de la landing en la sección "Sobre el asesor".
                  </span>
                </div>

                {/* Video de fondo del Hero */}
                <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 20, marginTop: 4 }}>
                  <h3 style={{ fontSize: "15px", fontWeight: 800, color: T.accent, marginBottom: 12 }}>
                    <i className="bi bi-play-btn-fill" style={{ marginRight: 6 }}></i>
                    Video de Fondo (Sección Principal)
                  </h3>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                    URL o ruta del archivo de video
                  </label>
                  <input
                    type="text"
                    value={bgVideoUrl}
                    onChange={(e) => setBgVideoUrl(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      background: T.inputBg,
                      border: `1px solid ${T.border}`,
                      borderRadius: "12px",
                      color: T.text,
                      fontSize: "14px",
                      outline: "none",
                      fontFamily: "monospace",
                    }}
                    placeholder="https://[tu-proyecto].supabase.co/storage/v1/object/public/assets/videos/..."
                  />
                  <span style={{ fontSize: "11px", color: T.muted, marginTop: 6, display: "block" }}>
                    Se muestra en loop, sin sonido, solo en la primera sección de la landing.
                  </span>

                  <label style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    marginTop: 10,
                    padding: "8px 16px",
                    borderRadius: "10px",
                    background: uploadingVideo ? "rgba(255,255,255,0.06)" : `${T.accent}20`,
                    border: `1px solid ${T.accent}40`,
                    color: uploadingVideo ? T.muted : T.accent,
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: uploadingVideo ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                  }}>
                    <i className={`bi ${uploadingVideo ? "bi-arrow-clockwise" : "bi-upload"}`} />
                    {uploadingVideo ? "Subiendo video..." : "Subir video desde mi PC"}
                    <input type="file" accept="video/mp4,video/webm" disabled={uploadingVideo} onChange={handleVideoUpload} style={{ display: "none" }} />
                  </label>

                  {/* Preview del video */}
                  {bgVideoUrl && (
                    <div style={{ marginTop: 12, borderRadius: "12px", overflow: "hidden", border: `1px solid ${T.border}`, background: "#000" }}>
                      <video
                        src={bgVideoUrl}
                        autoPlay
                        muted
                        loop
                        playsInline
                        style={{ width: "100%", height: "120px", objectFit: "cover", display: "block" }}
                      />
                    </div>
                  )}

                  {/* Specs recomendadas */}
                  <div style={{
                    marginTop: 12,
                    padding: "14px 16px",
                    borderRadius: "12px",
                    background: `${T.accent}08`,
                    border: `1px solid ${T.accent}25`,
                    fontSize: "12px",
                    color: T.muted,
                    lineHeight: 1.6,
                  }}>
                    <div style={{ fontWeight: 800, color: T.text, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                      <i className="bi bi-info-circle-fill" style={{ color: T.accent }}></i>
                      Especificaciones recomendadas
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 3 }}>
                      <li><strong style={{ color: T.text }}>Formato:</strong> MP4 (H.264) o WebM</li>
                      <li><strong style={{ color: T.text }}>Resolución:</strong> 1280x720 (720p) o 1920x1080 (1080p)</li>
                      <li><strong style={{ color: T.text }}>Relación:</strong> 16:9 horizontal (se ajusta con object-fit: cover)</li>
                      <li><strong style={{ color: T.text }}>Duración:</strong> 5 a 15 segundos (loop perfecto)</li>
                      <li><strong style={{ color: T.text }}>Tamaño:</strong> máximo 5 MB (ideal &lt; 2 MB)</li>
                      <li><strong style={{ color: T.text }}>Sin audio:</strong> se reproduce <code style={{ color: T.accent }}>muted</code></li>
                      <li><strong style={{ color: T.text }}>Tema:</strong> colores oscuros/azulados para no opacar el texto</li>
                    </ul>
                  </div>
                  <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={() => {
                        localStorage.setItem("bg_video_url", "/bg-loop.mp4");
                        setBgVideoUrl("/bg-loop.mp4");
                        showToast("Video por defecto aplicado");
                      }}
                      style={{ padding: "6px 12px", borderRadius: "8px", border: `1px solid ${T.border}`, background: "transparent", color: T.muted, fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                    >
                      <i className="bi bi-arrow-counterclockwise" style={{ marginRight: 4 }}></i>
                      Usar video por defecto
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        localStorage.setItem("bg_video_url", "");
                        setBgVideoUrl("");
                        showToast("Video quitado - se muestra solo color de fondo");
                      }}
                      style={{ padding: "6px 12px", borderRadius: "8px", border: `1px solid rgba(239,68,68,0.3)`, background: "rgba(239,68,68,0.05)", color: "#EF4444", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                    >
                      <i className="bi bi-trash3-fill" style={{ marginRight: 4 }}></i>
                      Quitar video (solo color)
                    </button>
                  </div>
                </div>

                {/* Configuración SMTP */}
                <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 20, marginTop: 4 }}>
                  <h3 style={{ fontSize: "15px", fontWeight: 800, color: T.accent, marginBottom: 12 }}>
                    <i className="bi bi-envelope-gear-fill" style={{ marginRight: 6 }}></i>
                    Correo Masivo (SMTP)
                  </h3>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                    Proveedor de correo
                  </label>
                  <select
                    value={emailProvider}
                    onChange={(e) => setEmailProvider(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      background: T.inputBg,
                      border: `1px solid ${T.border}`,
                      borderRadius: "12px",
                      color: T.text,
                      fontSize: "14px",
                      outline: "none",
                      marginBottom: 12,
                    }}
                  >
                    <option value="gmail">Gmail</option>
                    <option value="outlook">Outlook / Microsoft 365</option>
                    <option value="yahoo">Yahoo Mail</option>
                    <option value="zoho">Zoho Mail</option>
                    <option value="custom">SMTP personalizado</option>
                  </select>
                  {emailProvider === "custom" && (
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10, marginBottom: 12 }}>
                      <input
                        type="text"
                        value={emailSmtpHost}
                        onChange={(e) => setEmailSmtpHost(e.target.value)}
                        placeholder="smtp.tudominio.com"
                        style={{
                          width: "100%", padding: "12px 16px", background: T.inputBg, border: `1px solid ${T.border}`, borderRadius: "12px", color: T.text, fontSize: "14px", outline: "none",
                        }}
                      />
                      <input
                        type="text"
                        value={emailSmtpPort}
                        onChange={(e) => setEmailSmtpPort(e.target.value)}
                        placeholder="587"
                        style={{
                          width: "100%", padding: "12px 16px", background: T.inputBg, border: `1px solid ${T.border}`, borderRadius: "12px", color: T.text, fontSize: "14px", outline: "none",
                        }}
                      />
                    </div>
                  )}
                  <input
                    type="email"
                    value={emailSmtpUser}
                    onChange={(e) => setEmailSmtpUser(e.target.value)}
                    placeholder="Usuario / email"
                    style={{
                      width: "100%", marginBottom: 10, padding: "12px 16px", background: T.inputBg, border: `1px solid ${T.border}`, borderRadius: "12px", color: T.text, fontSize: "14px", outline: "none",
                    }}
                  />
                  <input
                    type="password"
                    value={emailSmtpPass}
                    onChange={(e) => setEmailSmtpPass(e.target.value)}
                    placeholder="Contraseña o clave de aplicación"
                    style={{
                      width: "100%", marginBottom: 10, padding: "12px 16px", background: T.inputBg, border: `1px solid ${T.border}`, borderRadius: "12px", color: T.text, fontSize: "14px", outline: "none",
                    }}
                  />
                  <input
                    type="email"
                    value={emailFrom}
                    onChange={(e) => setEmailFrom(e.target.value)}
                    placeholder="Email remitente (opcional)"
                    style={{
                      width: "100%", marginBottom: 10, padding: "12px 16px", background: T.inputBg, border: `1px solid ${T.border}`, borderRadius: "12px", color: T.text, fontSize: "14px", outline: "none",
                    }}
                  />
                  <span style={{ fontSize: "11px", color: T.muted, marginTop: 6, display: "block" }}>
                    Estos datos se guardan en tu navegador y se usan en la pestaña Correos. Para Gmail usa una <b>contraseña de aplicación</b>.
                  </span>
                </div>

                {/* Meta Pixel */}
                <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 20, marginTop: 4 }}>
                  <h3 style={{ fontSize: "15px", fontWeight: 800, color: T.accent, marginBottom: 12 }}>
                    <i className="bi bi-meta" style={{ marginRight: 6 }}></i>
                    Meta Pixel (Facebook / Instagram Ads)
                  </h3>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                    ID del Pixel (solo números)
                  </label>
                  <input
                    type="text"
                    value={metaPixelId}
                    onChange={(e) => setMetaPixelId(e.target.value.replace(/[^\d]/g, ""))}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      background: T.inputBg,
                      border: `1px solid ${T.border}`,
                      borderRadius: "12px",
                      color: T.text,
                      fontSize: "14px",
                      outline: "none",
                      fontFamily: "monospace",
                      letterSpacing: "0.05em",
                    }}
                    placeholder="Ej: 123456789012345"
                  />
                  <span style={{ fontSize: "11px", color: T.muted, marginTop: 6, display: "block" }}>
                    Ingresa el ID numérico de tu Pixel desde Meta Business Manager. Se inyectará automáticamente en la landing de ventas para rastrear PageView y conversión de leads.
                  </span>
                  {metaPixelId && (
                    <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: "10px", background: `${T.accent}10`, border: `1px solid ${T.accent}30`, display: "flex", alignItems: "center", gap: 8 }}>
                      <i className="bi bi-check-circle-fill" style={{ color: T.accent4, fontSize: 16 }}></i>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: T.text }}>
                        Pixel activo: <code style={{ color: T.accent, fontFamily: "monospace" }}>{metaPixelId}</code>
                      </span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  style={{
                    background: `linear-gradient(135deg, ${T.accent} 0%, #0077A8 100%)`,
                    color: T.bg,
                    fontWeight: 800,
                    padding: "14px",
                    borderRadius: "12px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                    boxShadow: T.glowCyan,
                    transition: "all 0.2s",
                    marginTop: "10px",
                  }}
                >
                  <i className="bi bi-check-lg" style={{ marginRight: 6 }}></i>
                  Guardar Configuración
                </button>
              </form>
            </div>
          )}

          {/* ── MENU: MENSAJES DIRECTOS WHATSAPP ── */}
          {activeMenu === "whatsapp" && (
            <div
              style={{
                background: T.bgCard,
                border: `1px solid ${T.border}`,
                borderRadius: "24px",
                padding: "36px",
                boxShadow: "0 20px 50px rgba(0, 0, 0, 0.15)",
                maxWidth: "900px",
                margin: "0 auto",
              }}
            >
              <h2 style={{ fontSize: "20px", fontWeight: 800, color: T.accent, marginBottom: 6 }}>
                <i className="bi bi-whatsapp" style={{ marginRight: 8, color: "#25D366" }}></i>
                Mensajes Directos WhatsApp
              </h2>
              <p style={{ fontSize: "13px", color: T.muted, marginBottom: 24 }}>
                Escribe una plantilla, selecciona clientes y envía mensajes personalizados en masa automáticamente.
              </p>

              {/* ── Toggle de Modo ── */}
              <div style={{ display: "flex", gap: 8, marginBottom: 24, background: T.inputBg, padding: 6, borderRadius: "14px", border: `1px solid ${T.border}` }}>
                {[
                  { id: "single", icon: "bi-person-fill", label: "Mensaje Individual" },
                  { id: "mass", icon: "bi-people-fill", label: "Envío en Masa" },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setWaMode(m.id)}
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: "10px",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      fontSize: "14px",
                      fontWeight: 800,
                      transition: "all 0.2s",
                      background: waMode === m.id ? `linear-gradient(135deg, ${T.accent} 0%, ${T.accent2} 100%)` : "transparent",
                      color: waMode === m.id ? "#FFFFFF" : T.muted,
                      boxShadow: waMode === m.id ? T.glowCyan : "none",
                    }}
                  >
                    <i className={`bi ${m.icon}`}></i>
                    {m.label}
                  </button>
                ))}
              </div>

              {/* ══════ MODO: MENSAJE INDIVIDUAL ══════ */}
              {waMode === "single" && (
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                    Cliente Destinatario
                  </label>
                  <div style={{ position: "relative", marginBottom: 20 }}>
                    <button
                      onClick={openClientSelector}
                      style={{
                        width: "100%",
                        padding: "14px 16px",
                        background: selectedLead ? T.inputBg : "transparent",
                        border: `2px solid ${selectedLead ? T.accent : T.border}`,
                        borderRadius: "12px",
                        color: selectedLead ? T.text : T.muted,
                        fontSize: "14px",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                        transition: "all 0.2s",
                      }}
                    >
                      {selectedLead ? (
                        <span style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                          <i className="bi bi-person-fill" style={{ color: T.accent }}></i>
                          <strong style={{ color: T.text }}>{selectedLead.name}</strong>
                          <span style={{ color: T.muted, fontSize: "13px" }}>+56 {selectedLead.phone}</span>
                          <span style={{ fontSize: "10px", fontWeight: 800, padding: "2px 8px", borderRadius: "10px", background: STATUS_CONFIG[selectedLead.status]?.bg, color: STATUS_CONFIG[selectedLead.status]?.text }}>{selectedLead.status}</span>
                        </span>
                      ) : (
                        <span style={{ display: "flex", alignItems: "center", gap: 8, color: T.muted }}>
                          <i className="bi bi-search"></i>
                          Buscar y seleccionar cliente...
                        </span>
                      )}
                      <i className={`bi ${clientSelectorOpen ? "bi-chevron-up" : "bi-chevron-down"}`} style={{ color: T.muted }}></i>
                    </button>

                    {clientSelectorOpen && (
                      <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: "14px", boxShadow: "0 12px 40px rgba(0,0,0,0.25)", zIndex: 100, maxHeight: "400px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                        <div style={{ position: "relative", borderBottom: `1px solid ${T.border}` }}>
                          <i className="bi bi-search" style={{ position: "absolute", left: 14, top: 14, color: T.muted }}></i>
                          <input
                            type="text"
                            placeholder="Buscar por nombre, teléfono o ciudad..."
                            autoFocus
                            value={clientSearch}
                            onChange={(e) => setClientSearch(e.target.value)}
                            style={{ width: "100%", padding: "12px 14px 12px 40px", background: "transparent", border: "none", color: T.text, fontSize: "14px", outline: "none" }}
                          />
                        </div>
                        <div style={{ overflowY: "auto", flex: 1 }}>
                          {filteredLeadsForSelector.length === 0 ? (
                            <div style={{ padding: "30px", textAlign: "center", color: T.muted, fontSize: "14px" }}>No se encontraron clientes.</div>
                          ) : (
                            filteredLeadsForSelector.map((lead) => (
                              <div
                                key={lead.id}
                                onClick={() => selectClient(lead)}
                                onMouseEnter={(e) => (e.currentTarget.style.background = `${T.accent}10`)}
                                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, cursor: "pointer", borderBottom: `1px solid ${T.border}` }}
                              >
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${T.accent}20`, color: T.accent, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "13px", flexShrink: 0 }}>
                                    {lead.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div style={{ fontSize: "14px", fontWeight: 700, color: T.text }}>{lead.name}</div>
                                    <div style={{ fontSize: "12px", color: T.muted }}>+56 {lead.phone} · {lead.city}</div>
                                  </div>
                                </div>
                                <span style={{ fontSize: "10px", fontWeight: 800, padding: "3px 8px", borderRadius: "10px", background: STATUS_CONFIG[lead.status]?.bg, color: STATUS_CONFIG[lead.status]?.text, whiteSpace: "nowrap" }}>{lead.status}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                    Mensaje Personalizado
                  </label>
                  <textarea
                    rows={5}
                    value={whatsappMsg}
                    onChange={(e) => setWhatsappMsg(e.target.value)}
                    disabled={!selectedLead}
                    placeholder={selectedLead ? `Escribe tu mensaje para ${selectedLead.name}...` : "Primero selecciona un cliente..."}
                    style={{ width: "100%", padding: "14px 16px", background: selectedLead ? T.inputBg : "rgba(128,128,128,0.05)", border: `1px solid ${T.border}`, borderRadius: "12px", color: T.text, fontSize: "14px", outline: "none", resize: "vertical", lineHeight: 1.6, fontFamily: "inherit" }}
                  />
                  <span style={{ fontSize: "11px", color: T.muted, marginTop: 6, display: "block", marginBottom: 24 }}>
                    {whatsappMsg.length} caracteres · {whatsappMsg.length > 0 ? "Listo para enviar" : "Escribe el mensaje para el cliente"}
                  </span>

                  <button
                    onClick={sendCustomWhatsApp}
                    disabled={!selectedLead || !whatsappMsg.trim()}
                    style={{
                      width: "100%",
                      background: "linear-gradient(135deg, #25D366 0%, #1ebe5a 100%)",
                      color: "#FFFFFF",
                      fontWeight: 800,
                      padding: "16px",
                      borderRadius: "12px",
                      border: "none",
                      cursor: !selectedLead || !whatsappMsg.trim() ? "not-allowed" : "pointer",
                      fontSize: "15px",
                      opacity: !selectedLead || !whatsappMsg.trim() ? 0.5 : 1,
                      boxShadow: "0 4px 20px rgba(37, 211, 102, 0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                      transition: "all 0.2s",
                    }}
                  >
                    <i className="bi bi-whatsapp" style={{ fontSize: 20 }}></i>
                    {selectedLead ? `Enviar WhatsApp a ${selectedLead.name}` : "Selecciona un cliente para enviar"}
                  </button>
                </div>
              )}

              {/* ══════ MODO: ENVÍO EN MASA ══════ */}
              {waMode === "mass" && (
                <div>
                  {/* ── Plantilla con variables ── */}
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 16 : 24, marginBottom: 24 }}>
                    {/* Columna plantilla */}
                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                        Plantilla del Mensaje
                      </label>
                      <textarea
                        rows={6}
                        value={bulkTemplate}
                        onChange={(e) => setBulkTemplate(e.target.value)}
                        placeholder="Escribe el mensaje usando variables..."
                        style={{ width: "100%", padding: "14px 16px", background: T.inputBg, border: `1px solid ${T.border}`, borderRadius: "12px", color: T.text, fontSize: "13px", outline: "none", resize: "vertical", lineHeight: 1.5, fontFamily: "inherit" }}
                      />
                      <span style={{ fontSize: "11px", color: T.muted, marginTop: 8, display: "block" }}>
                        Las variables se reemplazan automáticamente por los datos de cada cliente.
                      </span>
                      {/* Inyectar variable en el cursor */}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
                        {[
                          { tag: "{{nombre}}", label: "Nombre" },
                          { tag: "{{telefono}}", label: "Teléfono" },
                          { tag: "{{ciudad}}", label: "Ciudad" },
                          { tag: "{{direccion}}", label: "Dirección" },
                          { tag: "{{plan}}", label: "Plan" },
                          { tag: "{{estado}}", label: "Estado" },
                        ].map((v) => (
                          <button
                            key={v.tag}
                            type="button"
                            onClick={() => setBulkTemplate((prev) => prev + " " + v.tag)}
                            style={{
                              padding: "4px 10px",
                              borderRadius: "8px",
                              border: `1px solid ${T.accent}40`,
                              background: `${T.accent}10`,
                              color: T.accent,
                              fontSize: "12px",
                              fontWeight: 700,
                              cursor: "pointer",
                              fontFamily: "inherit",
                            }}
                          >
                            <i className="bi bi-plus-lg" style={{ marginRight: 4 }}></i>
                            {v.label}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => setBulkTemplate("Hola {{nombre}}, soy tu ejecutiva Mundo. Te escribo por tu consulta sobre el plan {{plan}} para {{ciudad}}. ¿Avanzamos con la factibilidad? Responde y lo gestiono.")}
                        style={{ marginTop: 10, padding: "6px 12px", borderRadius: "8px", border: `1px solid ${T.border}`, background: "transparent", color: T.muted, fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                      >
                        <i className="bi bi-arrow-counterclockwise" style={{ marginRight: 4 }}></i>
                        Restaurar plantilla por defecto
                      </button>
                    </div>

                    {/* Columna preview */}
                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                        Vista Previa (cliente de ejemplo)
                      </label>
                      <div style={{ background: "#0B141A", border: `1px solid ${T.border}`, borderRadius: "12px", padding: "16px", minHeight: "180px", fontSize: "13px", color: "#E9EDEF", lineHeight: 1.6, fontFamily: "'Inter', sans-serif", whiteSpace: "pre-wrap" }}>
                        {bulkPreviewLead ? (
                          <>
                            <div style={{ fontSize: "11px", color: "#8696A0", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                              <i className="bi bi-person-fill"></i> {bulkPreviewLead.name} · +56 {bulkPreviewLead.phone} · {bulkPreviewLead.city}
                            </div>
                            {renderTemplate(bulkTemplate, bulkPreviewLead) || <span style={{ opacity: 0.5 }}>Escribe la plantilla para ver el resultado...</span>}
                          </>
                        ) : (
                          <span style={{ opacity: 0.5, fontStyle: "italic" }}>Selecciona clientes para previsualizar el mensaje.</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ── Filtros de selección ── */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16, alignItems: "center" }}>
                    <div style={{ position: "relative", flex: "1 1 240px" }}>
                      <i className="bi bi-search" style={{ position: "absolute", left: 12, top: 11, color: T.muted }}></i>
                      <input
                        type="text"
                        placeholder="Buscar nombre / teléfono / ciudad / plan..."
                        value={bulkSearch}
                        onChange={(e) => setBulkSearch(e.target.value)}
                        style={{ width: "100%", padding: "10px 14px 10px 36px", borderRadius: "10px", background: T.inputBg, border: `1px solid ${T.border}`, color: T.text, fontSize: "13px", outline: "none" }}
                      />
                    </div>
                    <select
                      value={bulkStatusFilter}
                      onChange={(e) => setBulkStatusFilter(e.target.value)}
                      style={{ padding: "10px 14px", borderRadius: "10px", background: T.inputBg, border: `1px solid ${T.border}`, color: T.text, fontSize: "13px", fontWeight: 700, outline: "none", cursor: "pointer", fontFamily: "inherit" }}
                    >
                      <option value="Todos">Todos los estados</option>
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <select
                      value={bulkCityFilter}
                      onChange={(e) => setBulkCityFilter(e.target.value)}
                      style={{ padding: "10px 14px", borderRadius: "10px", background: T.inputBg, border: `1px solid ${T.border}`, color: T.text, fontSize: "13px", fontWeight: 700, outline: "none", cursor: "pointer", fontFamily: "inherit" }}
                    >
                      {uniqueCities.map((c) => (
                        <option key={c} value={c}>{c === "Todas" ? "Todas las ciudades" : c}</option>
                      ))}
                    </select>
                  </div>

                  {/* ── Acciones de selección ── */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12, alignItems: "center" }}>
                    <button onClick={selectAllBulkFiltered} style={{ padding: "8px 14px", borderRadius: "10px", border: `1px solid ${T.accent}40`, background: `${T.accent}10`, color: T.accent, fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                      <i className="bi bi-check2-all" style={{ marginRight: 6 }}></i>
                      Seleccionar filtrados ({bulkFilteredLeads.length})
                    </button>
                    <button onClick={clearBulkSelection} style={{ padding: "8px 14px", borderRadius: "10px", border: `1px solid ${T.border}`, background: "transparent", color: T.muted, fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                      <i className="bi bi-x-lg" style={{ marginRight: 6 }}></i>
                      Limpiar selección
                    </button>
                    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: "13px", fontWeight: 800, color: selectedBulkLeads.length > 0 ? T.accent : T.muted }}>
                        <i className="bi bi-people-fill" style={{ marginRight: 4 }}></i>
                        {selectedBulkLeads.length} seleccionados
                      </span>
                    </div>
                  </div>

                  {/* ── Lista de clientes (selección masiva) ── */}
                  <div style={{ border: `1px solid ${T.border}`, borderRadius: "14px", maxHeight: "320px", overflowY: "auto", marginBottom: 20 }}>
                    {bulkFilteredLeads.length === 0 ? (
                      <div style={{ padding: "30px", textAlign: "center", color: T.muted, fontSize: "14px" }}>
                        <i className="bi bi-inbox" style={{ fontSize: 28, opacity: 0.5, display: "block", marginBottom: 8 }}></i>
                        No hay clientes que coincidan con los filtros.
                      </div>
                    ) : (
                      bulkFilteredLeads.map((lead) => {
                        const checked = bulkSelectedIds.includes(lead.id);
                        return (
                          <div
                            key={lead.id}
                            onClick={() => { toggleBulkId(lead.id); setBulkPreviewId(lead.id); }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = `${T.accent}08`)}
                            onMouseLeave={(e) => (e.currentTarget.style.background = checked ? `${T.accent}10` : "transparent")}
                            style={{
                              padding: "12px 16px",
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                              cursor: "pointer",
                              borderBottom: `1px solid ${T.border}`,
                              background: checked ? `${T.accent}15` : "transparent",
                            }}
                          >
                            <div style={{ width: 22, height: 22, borderRadius: "6px", border: `2px solid ${checked ? T.accent : T.border}`, background: checked ? T.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#FFFFFF" }}>
                              {checked && <i className="bi bi-check-lg" style={{ fontSize: 14, fontWeight: 900 }}></i>}
                            </div>
                            <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${T.accent}20`, color: T.accent, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "13px", flexShrink: 0 }}>
                              {lead.name.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: "14px", fontWeight: 700, color: T.text }}>{lead.name}</div>
                              <div style={{ fontSize: "12px", color: T.muted }}>
                                +56 {lead.phone} · {lead.city} · {lead.plan}
                              </div>
                            </div>
                            <span style={{ fontSize: "10px", fontWeight: 800, padding: "3px 8px", borderRadius: "10px", background: STATUS_CONFIG[lead.status]?.bg, color: STATUS_CONFIG[lead.status]?.text, whiteSpace: "nowrap" }}>
                              {lead.status}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* ── Delay entre envíos ── */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
                    <label style={{ fontSize: "12px", fontWeight: 700, color: T.muted }}>Espera entre mensajes:</label>
                    <input
                      type="range"
                      min="300"
                      max="3000"
                      step="100"
                      value={bulkDelay}
                      onChange={(e) => setBulkDelay(Number(e.target.value))}
                      style={{ flex: "0 1 200px", accentColor: T.accent }}
                    />
                    <span style={{ fontSize: "12px", fontWeight: 700, color: T.accent }}>{(bulkDelay / 1000).toFixed(1)}s</span>
                    <div style={{ flex: "1 1 100%", fontSize: "11px", color: T.muted, display: "flex", alignItems: "center", gap: 6 }}>
                      <i className="bi bi-info-circle-fill" style={{ color: T.secondary }}></i>
                      Permite que cada pestaña cargue antes de abrir la siguiente. Evita que el navegador bloquee pop-ups.
                    </div>
                  </div>

                  {/* ── Progreso de envío ── */}
                  {bulkSending && (
                    <div style={{ marginBottom: 20, padding: "16px", borderRadius: "12px", background: `${T.accent}10`, border: `1px solid ${T.accent}30` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <span style={{ fontSize: "13px", fontWeight: 700, color: T.accent, display: "flex", alignItems: "center", gap: 6 }}>
                          <i className="bi bi-arrow-clockwise" style={{ animation: "spin 1s linear infinite" }}></i>
                          Enviando mensajes...
                        </span>
                        <span style={{ fontSize: "13px", fontWeight: 800, color: T.text }}>
                          {bulkProgress.sent} / {bulkProgress.total}
                        </span>
                      </div>
                      <div style={{ height: "8px", background: T.inputBg, borderRadius: "4px", overflow: "hidden" }}>
                        <div style={{
                          width: `${(bulkProgress.sent / Math.max(bulkProgress.total, 1)) * 100}%`,
                          height: "100%",
                          background: `linear-gradient(90deg, ${T.accent}, ${T.accent2})`,
                          borderRadius: "4px",
                          transition: "width 0.3s ease",
                        }} />
                      </div>
                      {bulkProgress.current && (
                        <div style={{ fontSize: "12px", color: T.muted, marginTop: 8 }}>
                          Abriendo chat de <strong style={{ color: T.text }}>{bulkProgress.current.name}</strong> (+56 {bulkProgress.current.phone})...
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Botones de acción ── */}
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <button
                      onClick={sendBulkWhatsApp}
                      disabled={selectedBulkLeads.length === 0 || bulkSending}
                      style={{
                        flex: "1 1 240px",
                        background: "linear-gradient(135deg, #25D366 0%, #1ebe5a 100%)",
                        color: "#FFFFFF",
                        fontWeight: 800,
                        padding: "16px",
                        borderRadius: "12px",
                        border: "none",
                        cursor: selectedBulkLeads.length === 0 || bulkSending ? "not-allowed" : "pointer",
                        fontSize: "15px",
                        opacity: selectedBulkLeads.length === 0 || bulkSending ? 0.5 : 1,
                        boxShadow: "0 4px 20px rgba(37, 211, 102, 0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10,
                        transition: "all 0.2s",
                      }}
                    >
                      <i className="bi bi-whatsapp" style={{ fontSize: 20 }}></i>
                      {selectedBulkLeads.length > 0 ? `Enviar a ${selectedBulkLeads.length} clientes` : "Selecciona clientes"}
                    </button>
                    <button
                      onClick={copyBulkLinks}
                      disabled={selectedBulkLeads.length === 0 || bulkSending}
                      style={{
                        flex: "0 1 200px",
                        background: "transparent",
                        color: T.accent,
                        fontWeight: 700,
                        padding: "16px",
                        borderRadius: "12px",
                        border: `1px solid ${T.accent}40`,
                        cursor: selectedBulkLeads.length === 0 || bulkSending ? "not-allowed" : "pointer",
                        fontSize: "14px",
                        opacity: selectedBulkLeads.length === 0 || bulkSending ? 0.5 : 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        transition: "all 0.2s",
                      }}
                    >
                      <i className="bi bi-clipboard-check-fill"></i>
                      Copiar enlaces
                    </button>
                  </div>

                  <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: "12px", background: "rgba(253, 220, 2, 0.08)", border: `1px solid ${T.secondary}30`, display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <i className="bi bi-exclamation-triangle-fill" style={{ color: T.secondary, fontSize: 16, marginTop: 2 }}></i>
                    <span style={{ fontSize: "12px", color: T.muted, lineHeight: 1.5 }}>
                      <strong style={{ color: T.text }}>Importante:</strong> se abrirá una pestaña nueva por cada cliente con el mensaje ya cargado. Permite los pop-ups emergentes en tu navegador para que funcione. WhatsApp no envía el mensaje automáticamente — tú debes pulsar "Enviar" en cada chat.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── MENU: IMPORTAR BASE DE DATOS ── */}
          {activeMenu === "import" && (
            <div>
              {/* Tarjeta de subida */}
              <div
                style={{
                  background: T.bgCard,
                  border: `1px solid ${T.border}`,
                  borderRadius: "24px",
                  padding: "40px",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
                  marginBottom: 30,
                }}
              >
                <h2 style={{ fontSize: "20px", fontWeight: 800, color: T.accent, marginBottom: 6 }}>
                  <i className="bi bi-file-earmark-spreadsheet-fill" style={{ marginRight: 8 }}></i>
                  Importar Base de Datos Excel
                </h2>
                <p style={{ fontSize: "13px", color: T.muted, marginBottom: 30 }}>
                  Sube un archivo Excel (.xlsx o .csv) con tus clientes. Columnas esperadas: Nombre, Telefono, Ciudad, Direccion, Plan, Estado.
                </p>

                {/* Zona de drag & drop visual */}
                <label
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 12,
                    padding: "48px 24px",
                    borderRadius: "16px",
                    border: `2px dashed ${importFile ? T.accent : T.border}`,
                    background: importFile ? `${T.accent}08` : T.inputBg,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    textAlign: "center",
                  }}
                >
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      setImportFile(e.target.files[0]);
                      setImportResult(null);
                    }}
                  />
                  <i className="bi bi-cloud-arrow-up-fill" style={{ fontSize: 48, color: importFile ? T.accent : T.muted }}></i>
                  {importFile ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <span style={{ fontSize: "16px", fontWeight: 700, color: T.text }}>{importFile.name}</span>
                      <span style={{ fontSize: "12px", color: T.muted }}>
                        {(importFile.size / 1024).toFixed(1)} KB · Listo para importar
                      </span>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <span style={{ fontSize: "16px", fontWeight: 700, color: T.text }}>Haz clic para subir tu archivo Excel</span>
                      <span style={{ fontSize: "12px", color: T.muted }}>Formatos soportados: .xlsx, .xls, .csv (máx 1000 filas)</span>
                    </div>
                  )}
                </label>

                {/* Plantilla descargable */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16, padding: "12px 16px", background: `${T.accent}08`, borderRadius: "12px", border: `1px solid ${T.accent}20` }}>
                  <i className="bi bi-info-circle-fill" style={{ color: T.accent, fontSize: 16 }}></i>
                  <span style={{ fontSize: "12px", color: T.muted, flex: 1 }}>
                    Tu Excel debe tener estos encabezados en la primera fila:
                  </span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                  {["Nombre", "Telefono", "Ciudad", "Direccion", "Plan", "Estado"].map((col) => (
                    <span key={col} style={{
                      padding: "4px 12px",
                      borderRadius: "8px",
                      background: `${T.accent}15`,
                      border: `1px solid ${T.accent}30`,
                      color: T.accent,
                      fontSize: "12px",
                      fontWeight: 700,
                    }}>
                      {col}
                    </span>
                  ))}
                </div>

                {/* Botón importar */}
                <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                  <button
                    onClick={handleImportUpload}
                    disabled={!importFile || importing}
                    style={{
                      flex: 1,
                      background: `linear-gradient(135deg, ${T.accent} 0%, ${T.accent2} 100%)`,
                      color: "#FFFFFF",
                      fontWeight: 800,
                      padding: "14px",
                      borderRadius: "12px",
                      border: "none",
                      cursor: (!importFile || importing) ? "not-allowed" : "pointer",
                      fontSize: "14px",
                      opacity: (!importFile || importing) ? 0.5 : 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      boxShadow: T.glowCyan,
                      transition: "all 0.2s",
                    }}
                  >
                    {importing ? (
                      <>
                        <i className="bi bi-arrow-clockwise" style={{ animation: "spin 1s linear infinite" }}></i>
                        Importando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-cloud-arrow-up-fill"></i>
                        Importar Clientes
                      </>
                    )}
                  </button>
                </div>

                {/* Resultado */}
                {importResult && (
                  <div
                    style={{
                      marginTop: 16,
                      padding: "14px 18px",
                      borderRadius: "12px",
                      background: importResult.type === "success" ? "rgba(37, 211, 102, 0.1)" : "rgba(239, 68, 68, 0.1)",
                      border: `1px solid ${importResult.type === "success" ? "rgba(37, 211, 102, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
                      color: importResult.type === "success" ? "#16A34A" : "#DC2626",
                      fontSize: "14px",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <i className={`bi ${importResult.type === "success" ? "bi-check-circle-fill" : "bi-exclamation-triangle-fill"}`}></i>
                    {importResult.message}
                  </div>
                )}
              </div>

              {/* Gráficos de datos */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 30 }}>
                {/* Distribución por Estado - Donut visual */}
                <div
                  style={{
                    background: T.bgCard,
                    border: `1px solid ${T.border}`,
                    borderRadius: "20px",
                    padding: "30px",
                  }}
                >
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: T.accent, marginBottom: 20 }}>
                    <i className="bi bi-pie-chart-fill" style={{ marginRight: 6 }}></i>
                    Distribución por Estado
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {STATUSES.map((s) => {
                      const count = importStats.byStatus[s] || 0;
                      const pct = importStats.total > 0 ? ((count / importStats.total) * 100).toFixed(0) : 0;
                      const sc = STATUS_CONFIG[s];
                      return (
                        <div key={s} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                            <span style={{ fontWeight: 600, color: T.text, display: "flex", alignItems: "center", gap: 6 }}>
                              <i className={`bi ${sc?.icon}`} style={{ color: sc?.dot }}></i>
                              {s}
                            </span>
                            <span style={{ fontWeight: 700, color: sc?.text }}>{count} ({pct}%)</span>
                          </div>
                          <div style={{ height: "8px", background: T.inputBg, borderRadius: "4px", overflow: "hidden" }}>
                            <div style={{
                              width: `${pct}%`,
                              height: "100%",
                              background: sc?.dot,
                              borderRadius: "4px",
                              transition: "width 0.6s ease",
                            }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Top Ciudades */}
                <div
                  style={{
                    background: T.bgCard,
                    border: `1px solid ${T.border}`,
                    borderRadius: "20px",
                    padding: "30px",
                  }}
                >
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: T.accent, marginBottom: 20 }}>
                    <i className="bi bi-geo-alt-fill" style={{ marginRight: 6 }}></i>
                    Clientes por Ciudad
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {importStats.topCities.map((c, i) => {
                      const maxVal = importStats.topCities[0]?.value || 1;
                      const pct = (c.value / maxVal) * 100;
                      const colors = [T.accent, T.accent2, T.accent4, T.secondary, "#FF6B35", "#A855F7"];
                      return (
                        <div key={c.name} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                            <span style={{ fontWeight: 600, color: T.text }}>{c.name}</span>
                            <span style={{ fontWeight: 700, color: colors[i] }}>{c.value}</span>
                          </div>
                          <div style={{ height: "8px", background: T.inputBg, borderRadius: "4px", overflow: "hidden" }}>
                            <div style={{
                              width: `${pct}%`,
                              height: "100%",
                              background: colors[i],
                              borderRadius: "4px",
                              transition: "width 0.6s ease",
                            }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Top Planes Solicitados */}
                <div
                  style={{
                    background: T.bgCard,
                    border: `1px solid ${T.border}`,
                    borderRadius: "20px",
                    padding: "30px",
                  }}
                >
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: T.accent, marginBottom: 20 }}>
                    <i className="bi bi-bar-chart-fill" style={{ marginRight: 6 }}></i>
                    Planes Más Solicitados
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {importStats.topPlans.map((p, i) => {
                      const maxVal = importStats.topPlans[0]?.value || 1;
                      const pct = (p.value / maxVal) * 100;
                      const colors = [T.accent, T.accent2, T.accent4, T.secondary, "#FF6B35"];
                      return (
                        <div key={p.name} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                            <span style={{ fontWeight: 600, color: T.text }}>{p.name}</span>
                            <span style={{ fontWeight: 700, color: colors[i] }}>{p.value}</span>
                          </div>
                          <div style={{ height: "8px", background: T.inputBg, borderRadius: "4px", overflow: "hidden" }}>
                            <div style={{
                              width: `${pct}%`,
                              height: "100%",
                              background: colors[i],
                              borderRadius: "4px",
                              transition: "width 0.6s ease",
                            }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Tabla resumen de gestiones */}
              <div
                style={{
                  background: T.bgCard,
                  border: `1px solid ${T.border}`,
                  borderRadius: "20px",
                  padding: "30px",
                  marginTop: 30,
                }}
              >
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: T.accent, marginBottom: 20 }}>
                  <i className="bi bi-table" style={{ marginRight: 6 }}></i>
                  Resumen de Gestión Total
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16 }}>
                  {[
                    { label: "Total Clientes", value: importStats.total, icon: "bi-people-fill", color: T.accent },
                    { label: "Nuevos", value: importStats.byStatus["Nuevo"] || 0, icon: "bi-star-fill", color: "#00B4D8" },
                    { label: "Contactados", value: (importStats.byStatus["Contactado"] || 0) + (importStats.byStatus["En Proceso"] || 0), icon: "bi-chat-dots-fill", color: "#25D366" },
                    { label: "Con Factibilidad", value: importStats.byStatus["Con Factibilidad"] || 0, icon: "bi-check-circle-fill", color: "#10B981" },
                    { label: "Sin Factibilidad", value: importStats.byStatus["Sin Factibilidad"] || 0, icon: "bi-x-circle-fill", color: "#F97316" },
                    { label: "No Contesta", value: importStats.byStatus["No Contesta"] || 0, icon: "bi-telephone-x-fill", color: "#EF4444" },
                  ].map((stat) => (
                    <div key={stat.label} style={{
                      padding: "18px",
                      borderRadius: "14px",
                      background: T.inputBg,
                      border: `1px solid ${T.border}`,
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}>
                      <div style={{
                        width: 42,
                        height: 42,
                        borderRadius: "12px",
                        background: `${stat.color}20`,
                        border: `1px solid ${stat.color}40`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        <i className={`bi ${stat.icon}`} style={{ color: stat.color, fontSize: 18 }}></i>
                      </div>
                      <div>
                        <div style={{ fontSize: "24px", fontWeight: 900, color: T.text }}>{stat.value}</div>
                        <div style={{ fontSize: "10px", color: T.muted, fontWeight: 700, textTransform: "uppercase" }}>{stat.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
