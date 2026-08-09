(function () {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const slug = params.get("slug");
  if ((!id && !slug) || window.location.pathname.split("/").pop() === "l.html") return;

  const url = id
    ? "/api/sellers?id=" + encodeURIComponent(id)
    : "/api/sellers?slug=" + encodeURIComponent(slug);

   fetch(url, { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : null))
    .then((seller) => {
      if (!seller) {
        // ID inválido → 404
        document.body.innerHTML = '';
        document.title = '404 - No encontrado';
        document.body.style.cssText = 'display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0B0F14;color:#f0f0f5;font-family:sans-serif;font-size:18px;';
        document.body.textContent = 'Página no encontrada';
        return;
      }

      const phone = (seller.phone || "").replace(/\D/g, "");
      const name = seller.name || "Ejecutivo";
      const photo = seller.photo || "";
      const bio = seller.bio || "";
      const heroContent = seller.landingContent?.hero || {};
      const heroImages = Array.from(new Set([
        heroContent.backgroundImageUrl,
        ...(Array.isArray(heroContent.backgroundImages) ? heroContent.backgroundImages : []),
      ].filter((url) => typeof url === "string" && url.trim())));

      const hero = document.querySelector(".hero");
      const heroSlides = Array.from(document.querySelectorAll(".hero-slide"));
      const setTextWithIcon = (element, value) => {
        if (!element || value === undefined || value === null) return;
        const icon = element.querySelector("i");
        element.textContent = "";
        if (icon) element.appendChild(icon);
        element.appendChild(document.createTextNode(` ${value}`));
      };
      const applyHeroContent = (content) => {
        const heroData = content?.hero || {};
        const slides = Array.isArray(heroData.slides) && heroData.slides.length > 0 ? heroData.slides : [heroData];
        heroSlides.forEach((slide, index) => {
          const data = slides[index];
          if (!data) return;
          const title = slide.querySelector(".hero-title, h1");
          const description = slide.querySelector(".hero-content p");
          const buttons = slide.querySelectorAll(".hero-ctas a");
          const badge = slide.querySelector(".badge-promo");
          const highlight = data.titleHighlight || "";
          if (title && data.title) {
            title.textContent = "";
            title.appendChild(document.createTextNode(data.title + " "));
            if (highlight) {
              const span = document.createElement("span");
              span.textContent = highlight;
              title.appendChild(span);
            }
          }
          if (description && data.description) description.textContent = data.description;
          if (badge && data.badge) setTextWithIcon(badge, data.badge);
          if (buttons[0] && data.ctaPrimary) buttons[0].textContent = data.ctaPrimary;
          if (buttons[1] && data.ctaSecondary) buttons[1].textContent = data.ctaSecondary;
        });
      };
      applyHeroContent(seller.landingContent);
      const setHeroBackground = (index = 0) => {
        if (!hero) return;
        const image = heroImages.length ? heroImages[index % heroImages.length] : "";
        hero.style.backgroundImage = image
          ? `linear-gradient(90deg, var(--hero-overlay-1) 0%, var(--hero-overlay-2) 55%, var(--hero-overlay-3) 100%), url("${image}")`
          : "none";
        hero.style.backgroundColor = "var(--bg-2)";
      };
      setHeroBackground(0);
      if (hero && heroSlides.length > 0) {
        const observer = new MutationObserver(() => {
          const active = hero.querySelector(".hero-slide.active");
          setHeroBackground(Number(active?.dataset.index || 0));
        });
        observer.observe(hero, { subtree: true, attributes: true, attributeFilter: ["class"] });

        let touchStartX = null;
        hero.addEventListener("touchstart", (event) => {
          touchStartX = event.touches[0]?.clientX ?? null;
        }, { passive: true });
        hero.addEventListener("touchend", (event) => {
          if (touchStartX === null) return;
          const delta = event.changedTouches[0]?.clientX - touchStartX;
          touchStartX = null;
          if (Math.abs(delta) < 45) return;
          const control = delta < 0 ? document.getElementById("heroNext") : document.getElementById("heroPrev");
          control?.click();
        }, { passive: true });
      }

      if (new URLSearchParams(window.location.search).get("preview") === "1") {
        window.parent?.postMessage({ type: "LANDING_PREVIEW_READY" }, window.location.origin);
        window.addEventListener("message", (event) => {
          if (event.origin !== window.location.origin || event.source !== window.parent) return;
          if (event.data?.type === "LANDING_PREVIEW_UPDATE") {
            applyHeroContent(event.data.payload?.content);
            if (event.data.payload?.profile?.photo) {
              document.querySelectorAll(".seller-avatar-wrapper img").forEach((image) => {
                image.src = event.data.payload.profile.photo;
              });
            }
          }
        });
      }

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
          Array.from(node.childNodes).forEach(walk);
        }
      }
      walk(document.body);

      document.querySelectorAll(".seller-avatar-wrapper img").forEach((image) => {
        if (photo) image.src = photo;
        image.alt = name;
      });

      const coverageForm = document.getElementById("coverageForm");
      if (coverageForm) {
        coverageForm.addEventListener("submit", async (event) => {
          // Capture phase prevents the legacy inline handler from opening the demo number.
          event.preventDefault();
          event.stopImmediatePropagation();

          const getValue = (selector) => document.querySelector(selector)?.value.trim() || "";
          const nameValue = getValue("#client-name");
          const phoneValue = getValue("#client-phone");
          const emailValue = getValue("#client-email");
          const cityValue = getValue("#client-city");
          const addressValue = getValue("#client-address");
          const planValue = getValue("#client-plan");
          const submitButton = coverageForm.querySelector("button[type='submit']");
          const popup = window.open("", "_blank");

          if (submitButton) {
            submitButton.disabled = true;
            submitButton.dataset.originalLabel = submitButton.innerHTML;
            submitButton.textContent = "Enviando...";
          }

          try {
            const response = await fetch("/api/leads", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: nameValue,
                phone: phoneValue,
                email: emailValue,
                city: cityValue,
                address: addressValue,
                plan: planValue,
                sellerId: seller.id || undefined,
              }),
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(result.error || "No se pudo guardar la solicitud");
            if (!phone) throw new Error("El vendedor no tiene WhatsApp configurado");

            const message = [
              `Hola ${name}, quiero consultar por un plan.`,
              "",
              `Nombre: ${nameValue}`,
              `Teléfono: ${phoneValue}`,
              `Correo: ${emailValue || "No informado"}`,
              `Ciudad/Comuna: ${cityValue}`,
              `Dirección: ${addressValue}`,
              `Plan de interés: ${planValue}`,
            ].join("\n");
            const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
            if (popup) popup.location.href = whatsappUrl;
            else window.open(whatsappUrl, "_blank", "noopener");

            coverageForm.reset();
            if (submitButton) submitButton.textContent = "Solicitud guardada";
          } catch (error) {
            if (popup) popup.close();
            window.alert(error.message || "No se pudo enviar la solicitud");
          } finally {
            if (submitButton) {
              submitButton.disabled = false;
              window.setTimeout(() => {
                if (submitButton.dataset.originalLabel) {
                  submitButton.innerHTML = submitButton.dataset.originalLabel;
                }
              }, 2500);
            }
          }
        }, true);
      }

      // Reemplazar bio genérica si el vendedor tiene bio personalizada
      if (bio) {
        const bioRegex = /Como tu ejecutivo comercial especializado de (Mundo|Movistar|Claro|VTR|WOM|Entel)[^.]*/;
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
