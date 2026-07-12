"use client";

import Image from "next/image";
import { SELLER_CONFIG } from "@/lib/seller";
import { getLogoUrl, shouldInvertLogo } from "@/lib/company";

const FOOTER_LINKS = [
  { id: "inicio", label: "Inicio" },
  { id: "asesor", label: "Tu Ejecutiva" },
  { id: "planes", label: "Planes Hogar" },
  { id: "cobertura", label: "Evaluar Cobertura" },
];

export default function Footer({ footerText, onScrollTo, sellerLabels = {}, sellerPhone = "", company = null, content = {} }) {
  const companyName = company?.name || "Mundo";
  const logoUrl = getLogoUrl(company, "footer");
  const invertLogo = shouldInvertLogo(company);
  const c = content || {};
  const footerLinks = Array.isArray(c.links) && c.links.length > 0 ? c.links : FOOTER_LINKS;

  const contactTitle = (c.contactTitle || "Contacto {executiveLabel}").replace(
    /{executiveLabel}/g,
    sellerLabels.executiveCapitalized || "Ejecutivo/a"
  );
  const nameLabel = (c.nameLabel || "Nombre {executiveLabel}").replace(
    /{executiveLabel}/g,
    sellerLabels.executiveCapitalized || "Ejecutivo/a"
  );

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-layout">
          <div className="footer-about">
            <Image
              src={logoUrl}
              alt={`${companyName} Logo Footer`}
              width={140}
              height={48}
              style={{
                objectFit: "contain",
                filter: invertLogo ? "brightness(0) invert(1)" : "none",
              }}
            />
            <p>{footerText}</p>
          </div>
          <div className="footer-links">
            <h4>{c.navTitle || "Navegación"}</h4>
            <ul>
              {footerLinks.map((link) => (
                <li key={link.id}>
                  <a
                    href={`#${link.id}`}
                    onClick={(e) => { e.preventDefault(); onScrollTo(link.id); }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="footer-contact">
            <h4>{contactTitle}</h4>
            <ul>
              <li>
                <i className="bi bi-person-fill"></i>
                <div>
                  <span className="footer-contact-title">{nameLabel}</span>
                  <span className="seller-name-placeholder">{SELLER_CONFIG.name}</span>
                </div>
              </li>
              <li>
                <i className="bi bi-whatsapp"></i>
                <div>
                  <span className="footer-contact-title">{c.whatsappLabel || "WhatsApp de Ventas"}</span>
                  {sellerPhone ? (
                    <a
                      href={`https://wa.me/${sellerPhone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "inherit", textDecoration: "none" }}
                    >
                      +{sellerPhone}
                    </a>
                  ) : (
                    <span>Atención Digital Inmediata</span>
                  )}
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 {companyName}. Página web de {sellerLabels.executiveCapitalized || "Ejecutivo/a"} de Ventas Oficial Independiente.</p>
          <p style={{ marginTop: "0.5rem", fontSize: "0.75rem" }}>
            {(c.bottomText || "Los logotipos, marcas comerciales y nombres de servicios exhibidos en este sitio son propiedad exclusiva de {companyName} y sus filiales. Este sitio tiene propósitos informativos y de captación comercial por parte de un {executive} oficial independiente.")
              .replace(/{companyName}/g, companyName)
              .replace(/{executive}/g, sellerLabels.executive || "ejecutivo")}
          </p>
          <p style={{ marginTop: "0.75rem" }}>
            <a
              href={`/politica-de-privacidad?company=${company?.slug || "mundo"}`}
              className="text-[var(--color-primary)] hover:underline font-medium"
            >
              Política de Privacidad y Cookies
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
