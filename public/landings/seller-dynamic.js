(function () {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug") || window.location.pathname.split("/").pop();
  if (!slug || slug.endsWith(".html")) return;

  fetch("/api/sellers?slug=" + encodeURIComponent(slug))
    .then((r) => (r.ok ? r.json() : null))
    .then((seller) => {
      if (!seller) return;

      const phone = (seller.phone || "").replace(/\D/g, "");
      const name = seller.name || "Ejecutivo";
      const photo = seller.photo || "";
      const bio = seller.bio || "";

      function formatPhone(p) {
        if (!p || p.length < 11) return "+56 9 0000 0000";
        return "+56 " + p.slice(2, 3) + " " + p.slice(3, 7) + " " + p.slice(7);
      }

      function walk(node) {
        if (node.nodeType === 3) {
          node.nodeValue = node.nodeValue
            .replace(/Carlos Méndez/g, name)
            .replace(/\b56951234567\b/g, phone)
            .replace(/\+56 9 5123 4567/g, formatPhone(phone));
        } else if (node.nodeType === 1) {
          if (node.tagName === "A" && node.href && node.href.includes("wa.me")) {
            node.href = node.href.replace(/56951234567/g, phone);
          }
          if (node.tagName === "IMG" && node.alt && node.alt.includes("Carlos") && photo) {
            node.src = photo;
          }
          Array.from(node.childNodes).forEach(walk);
        }
      }
      walk(document.body);

      // Reemplazar bio genérica si el vendedor tiene bio personalizada
      if (bio) {
        const bioRegex = /Como tu ejecutivo comercial especializado de (Movistar|Claro|VTR|WOM|Entel)[^.]*/;
        document.querySelectorAll("p").forEach((p) => {
          if (bioRegex.test(p.textContent)) {
            p.textContent = bio;
          }
        });
      }

      // Actualizar título y meta description
      if (name && seller.company?.name) {
        const title = document.querySelector("title");
        if (title) title.textContent = title.textContent.replace(/Carlos Méndez/g, name);
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute("content", metaDesc.getAttribute("content").replace(/Carlos Méndez/g, name));
      }
    })
    .catch(() => {});
})();
