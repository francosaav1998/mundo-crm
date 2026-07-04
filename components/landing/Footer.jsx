"use client";

import Image from "next/image";
import { SELLER_CONFIG } from "@/lib/seller";

const FOOTER_LINKS = [
  { id: "inicio", label: "Inicio" },
  { id: "asesor", label: "Tu Ejecutiva" },
  { id: "planes", label: "Planes Hogar" },
  { id: "cobertura", label: "Evaluar Cobertura" },
];

export default function Footer({ footerText, onScrollTo }) {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-layout">
          <div className="footer-about">
            <Image
              src="https://www.tumundo.cl/wp-content/uploads/2022/12/logo-mundo.svg"
              alt="Mundo Logo Footer"
              width={120}
              height={32}
            />
            <p>{footerText}</p>
          </div>
          <div className="footer-links">
            <h4>Navegación</h4>
            <ul>
              {FOOTER_LINKS.map((link) => (
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
            <h4>Contacto Ejecutiva</h4>
            <ul>
              <li>
                <i className="bi bi-person-fill"></i>
                <div>
                  <span className="footer-contact-title">Nombre Asesora</span>
                  <span className="seller-name-placeholder">{SELLER_CONFIG.name}</span>
                </div>
              </li>
              <li>
                <i className="bi bi-whatsapp"></i>
                <div>
                  <span className="footer-contact-title">WhatsApp de Ventas</span>
                  <span>Atención Digital Inmediata</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Mundo Telecomunicaciones. Página web de Asesora de Ventas Oficial Independiente.</p>
          <p style={{ marginTop: "0.5rem", fontSize: "0.75rem" }}>
            Los logotipos, marcas comerciales y nombres de servicios exhibidos en este sitio son
            propiedad exclusiva de Mundo Pacífico S.A. y sus filiales. Este sitio tiene propósitos
            informativos y de captación comercial por parte de una ejecutiva oficial independiente.
          </p>
        </div>
      </div>
    </footer>
  );
}
