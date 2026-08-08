export function normalizeB2BBranding(body) {
  return String(body || "")
    .replace(/Gestion Vendedores · CRM comercial y landings/g, "GestionVendedores.com · Plataforma comercial")
    .replace(/CRM Vendedor Mundo/gi, "GestionVendedores.com")
    .replace(/vendedores de Mundo/gi, "equipos comerciales")
    .replace(/CRM Vendedor Mundo es la herramienta/gi, "GestionVendedores.com es la plataforma")
    .replace(/https:\/\/images\.unsplash\.com\/photo-1460925891497-afd4d51b23e9\?auto=format&fit=crop&q=80&w=800/g, "/meta.jpg")
    .replace(/GestionVendedores\.com es la herramienta para ejecutivos de ventas/gi, "GestionVendedores.com es la plataforma para equipos comerciales");
}
