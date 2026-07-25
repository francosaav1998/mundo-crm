"use client";

import Image from "next/image";
import { SELLER_CONFIG } from "@/lib/seller";
import { getLogoUrl, shouldInvertLogo } from "@/lib/company";
import EditableText from "./EditableText";

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
            <p>
              <EditableText path="profile.footerText" multiline>
                {footerText || "Eres la cara de ventas oficial. Esta landing es tuya."}
              </EditableText>
            </p>
          </div>
          <div className="footer-links">
            <h4>
              <EditableText path="footer.navTitle">{c.navTitle || "Navegación"}</EditableText>
            </h4>
            <ul>
              {footerLinks.map((link, idx) => (
                <li key={link.id}>
                  <a
                    href={`#${link.id}`}
                    onClick={(e) => { e.preventDefault(); onScrollTo(link.id); }}
                  >
                    <EditableText path={`footer.links.${idx}.label`}>{link.label}</EditableText>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="footer-contact">
            <h4>
              <EditableText path="footer.contactTitle">{contactTitle}</EditableText>
            </h4>
            <ul>
              <li>
                <i className="bi bi-person-fill"></i>
                <div>
                  <span className="footer-contact-title">
                    <EditableText path="footer.nameLabel">{nameLabel}</EditableText>
                  </span>
                  <span className="seller-name-placeholder">
                    <EditableText path="profile.name">{SELLER_CONFIG.name}</EditableText>
                  </span>
                </div>
              </li>
              <li>
                <i className="bi bi-whatsapp"></i>
                <div>
                  <span className="footer-contact-title">
                    <EditableText path="footer.whatsappLabel">{c.whatsappLabel || "WhatsApp de Ventas"}</EditableText>
                  </span>
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
          <p>
            <EditableText path="footer.bottomText">
              {(c.bottomText || "Los logotipos, marcas comerciales y nombres de servicios exhibidos en este sitio son propiedad exclusiva de {companyName} y sus filiales. Este sitio tiene propósitos informativos y de captación comercial por parte de un {executive} oficial independiente.")
                .replace(/{companyName}/g, companyName)
                .replace(/{executive}/g, sellerLabels.executive || "ejecutivo")}
            </EditableText>
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
