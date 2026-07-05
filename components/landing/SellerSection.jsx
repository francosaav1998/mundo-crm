"use client";

import Image from "next/image";
import { SELLER_CONFIG } from "@/lib/seller";

const FALLBACK_AVATAR =
  "data:image/svg+xml;base64," +
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320">
      <rect width="320" height="320" fill="#00748E"/>
      <text x="50%" y="50%" font-size="120" fill="#FFFFFF" font-family="Montserrat,sans-serif" font-weight="800" text-anchor="middle" dominant-baseline="central">M</text>
    </svg>`
  ).toString("base64");

export default function SellerSection({ sellerPhotoUrl, sellerBioText, sellerLabels = {}, onScrollTo }) {
  const photo = sellerPhotoUrl || FALLBACK_AVATAR;

  return (
    <section id="asesor" className="seller-section scroll-animate fade-in-up">
      <div className="container">
        <div className="seller-card">
          <div className="seller-avatar-wrapper">
            <Image src={photo} alt={SELLER_CONFIG.name} fill sizes="320px" style={{ objectFit: "cover" }} />
            <span className="seller-badge">{sellerLabels.advisorCapitalized || "Asesor/a"} Oficial</span>
          </div>
          <div className="seller-info">
            <h4>Atención Personalizada</h4>
            <h2 className="seller-name-placeholder">{SELLER_CONFIG.name}</h2>
            <p>{sellerBioText}</p>
            <div className="seller-stats">
              <div className="stat-item">
                <span className="stat-num">5 Min</span>
                <span className="stat-label">Evaluación Cobertura</span>
              </div>
              <div className="stat-item">
                <span className="stat-num">24-48h</span>
                <span className="stat-label">Tiempo Instalación</span>
              </div>
              <div className="stat-item">
                <span className="stat-num">100%</span>
                <span className="stat-label">Gestión Digital</span>
              </div>
            </div>
            <button onClick={() => onScrollTo("cobertura")} className="btn btn-primary">
              <i className="bi bi-chat-dots-fill"></i> Iniciar Consulta Gratis
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
