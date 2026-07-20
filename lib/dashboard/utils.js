import { normalizeWhatsAppNumber } from "../seller.js";

export function renderTemplate(template, lead) {
  if (!lead) return template;
  return template
    .replace(/{{nombre}}/gi, lead.name || "")
    .replace(/{{telefono}}/gi, lead.phone || "")
    .replace(/{{email}}/gi, lead.email || "")
    .replace(/{{ciudad}}/gi, lead.city || "")
    .replace(/{{direccion}}/gi, lead.address || "")
    .replace(/{{plan}}/gi, lead.plan || "")
    .replace(/{{estado}}/gi, lead.status || "");
}

export function getUniqueCities(leads) {
  const set = new Set((leads || []).map((l) => l.city).filter(Boolean));
  return ["Todas", ...Array.from(set).sort()];
}

export function getWhatsAppUrl(phone, text) {
  const normalized = normalizeWhatsAppNumber(phone);
  const encodedText = encodeURIComponent(text || "");
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    typeof navigator !== "undefined" ? navigator.userAgent : ""
  );
  const baseUrl = isMobile ? "https://api.whatsapp.com/send" : "https://web.whatsapp.com/send";
  return `${baseUrl}?phone=${normalized}&text=${encodedText}`;
}

export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
  });
}

export function formatTime(dateString) {
  return new Date(dateString).toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function calculateKpis(leads) {
  const total = leads.length;
  const nuevos = leads.filter((l) => l.status === "Nuevo").length;
  const factibles = leads.filter((l) => l.status === "Con Factibilidad").length;
  const sinFactibilidad = leads.filter((l) => l.status === "Sin Factibilidad").length;
  const contactados = leads.filter(
    (l) => l.status === "Contactado" || l.status === "En Proceso"
  ).length;
  return { total, nuevos, factibles, sinFactibilidad, contactados };
}

export function calculateAdminKpis(leads) {
  const total = leads.length;
  const nuevos = leads.filter((l) => l.status === "Nuevo").length;
  const contactados = leads.filter((l) => l.status === "Contactado").length;
  const interesados = leads.filter((l) => l.status === "Interesado").length;
  const activos = leads.filter((l) => l.status === "Cliente Activo").length;
  return { total, nuevos, contactados, interesados, activos };
}

export function calculatePlanDistribution(leads) {
  const counts = {};
  (leads || []).forEach((l) => {
    const name = String(l.plan || "Sin Plan").split(" (")[0];
    counts[name] = (counts[name] || 0) + 1;
  });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

export function calculateDailyIntake(leads, days = 10) {
  const dates = {};
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const dateStr = d.toLocaleDateString("es-CL", { day: "2-digit", month: "short" });
    dates[dateStr] = 0;
  }

  (leads || []).forEach((l) => {
    const dateStr = new Date(l.createdAt).toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "short",
    });
    if (dates[dateStr] !== undefined) {
      dates[dateStr] += 1;
    }
  });

  return Object.entries(dates).map(([date, count]) => ({ date, count }));
}
