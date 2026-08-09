export function normalizeB2BBranding(body) {
  return String(body || "")
    .replace(/Gestion Vendedores · CRM comercial y landings/g, "GestionVendedores.com · Plataforma comercial")
    .replace(/CRM Vendedor Mundo/gi, "GestionVendedores.com")
    .replace(/vendedores de Mundo/gi, "equipos comerciales")
    .replace(/CRM Vendedor Mundo es la herramienta/gi, "GestionVendedores.com es la plataforma")
    .replace(/<h1>Tu oficina de ventas <span>en un solo lugar\.<\/span><\/h1>/, "<h1>Convierte tu equipo comercial <span>en una máquina de ventas.<\/span><\/h1>")
    .replace(/Accede al CRM diseñado para equipos comerciales\. Gestiona clientes, envía mensajes masivos y conecta tu campaña de Meta Ads\. Todo en una plataforma profesional\./, "Dale a cada vendedor una web que convierte, un CRM que ordena sus oportunidades y las herramientas para cerrar más ventas desde un solo lugar.")
    .replace(/<h1>¿Qué es un CRM y por qué te hace vender más\?<\/h1>/, "<h1>Deja de perder oportunidades <span>por falta de seguimiento.<\/span><\/h1>")
    .replace(/<h1>Clientes que llegan con datos reales\.<\/h1>/, "<h1>Más prospectos calificados <span>para tu equipo comercial.<\/span><\/h1>")
    .replace(/<h1>Mensajes masivos <span>y Meta Ads conectados\.<\/span><\/h1>/, "<h1>Más conversaciones. <span>Más cierres.<\/span><\/h1>")
    .replace(/https:\/\/images\.unsplash\.com\/photo-1460925891497-afd4d51b23e9\?auto=format&fit=crop&q=80&w=800/g, "/meta.jpg")
    .replace(/GestionVendedores\.com es la herramienta para ejecutivos de ventas/gi, "GestionVendedores.com es la plataforma para equipos comerciales");
}
