"use client";

import Image from "next/image";
import { SELLER_CONFIG } from "@/lib/seller";
import { getDefaultBio } from "@/lib/company";

const FALLBACK_AVATAR =
  "data:image/svg+xml;base64," +
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320">
      <rect width="320" height="320" fill="#00748E"/>
      <text x="50%" y="50%" font-size="120" fill="#FFFFFF" font-family="Montserrat,sans-serif" font-weight="800" text-anchor="middle" dominant-baseline="central">M</text>
    </svg>`
  ).toString("base64");

export default function SellerSection({
  sellerPhotoUrl,
  sellerBioText,
  sellerLabels = {},
  onScrollTo,
  company = null,
  content = {},
}) {
  const photo = sellerPhotoUrl || FALLBACK_AVATAR;
  const companyName = company?.name || "Mundo";
  const bio = sellerBioText || getDefaultBio(companyName, sellerLabels);
  const c = content || {};
  const stats = Array.isArray(c.stats) && c.stats.length > 0 ? c.stats : [
    { num: "5 Min", label: "Evaluación Cobertura" },
    { num: "24-48h", label: "Tiempo Instalación" },
    { num: "100%", label: "Gestión Digital" },
  ];

  return (
    <section id="asesor" className="seller-section">
      <div className="container">
        <div className="seller-card">
          <div className="seller-avatar-wrapper">
            <Image src={photo} alt={SELLER_CONFIG.name} fill sizes="320px" style={{ objectFit: "cover" }} />
            <span className="seller-badge">{sellerLabels.advisorCapitalized || "Asesor/a"} {companyName}</span>
          </div>
          <div className="seller-info">
            <h4>{c.eyebrow || "Atención Personalizada"}</h4>
            <h2 className="seller-name-placeholder">{SELLER_CONFIG.name}</h2>
            <p>{bio}</p>
            <div className="seller-stats">
              {stats.map((stat, idx) => (
                <div className="stat-item" key={idx}>
                  <span className="stat-num">{stat.num}</span>
                  <span className="stat-label">{stat.label}</span>
                </div>
              ))}
            </div>
            <button onClick={() => onScrollTo("cobertura")} className="btn btn-primary">
              <i className="bi bi-chat-dots-fill"></i> {c.cta || "Iniciar Consulta Gratis"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
