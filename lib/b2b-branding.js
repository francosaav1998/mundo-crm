const BRAND_LOGO = '<a href="#inicio" class="logo" aria-label="GestionVendedores.com"><span style="font-weight:900;font-size:1.1rem;letter-spacing:-0.03em;color:#ffffff;display:inline-flex;align-items:center;gap:.35rem;">Gestion<span style="color:#fddc02;">Vendedores</span><span style="font-size:.92rem;color:#ff8000;">.com</span></span></a>';

export function normalizeB2BBranding(body) {
  return String(body || "")
    .replace(/<a href="#inicio" class="logo">[\s\S]*?<\/a>/, BRAND_LOGO)
    .replace(/Gestion Vendedores · CRM comercial y landings/g, "GestionVendedores.com · Plataforma comercial")
    .replace(/Ejecutiva de Ventas Oficial Mundo/g, "GestionVendedores.com · Plataforma comercial")
    .replace(/CRM Vendedor Mundo/g, "GestionVendedores.com")
    .replace(/Mundo CRM/g, "GestionVendedores.com")
    .replace(/Mundo Logo/g, "GestionVendedores.com")
    .replace(/\bMundo\b/g, "GestionVendedores.com")
    .replace(/https:\/\/images\.unsplash\.com\/photo-1460925891497-afd4d51b23e9\?auto=format&fit=crop&q=80&w=800/g, "/meta.jpg")
    .replace(/https:\/\/www\.tumundo\.cl\/wp-content\/uploads\/2022\/12\/logo-mundo-negative\.svg/g, "");
}
