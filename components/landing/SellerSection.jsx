"use client";

import Image from "next/image";
import { SELLER_CONFIG } from "@/lib/seller";

export default function SellerSection({ sellerPhotoUrl, sellerBioText, onScrollTo }) {
  return (
    <section id="asesor" className="seller-section scroll-animate fade-in-up">
      <div className="container">
        <div className="seller-card">
          <div className="seller-avatar-wrapper">
            <Image
              src={sellerPhotoUrl}
              alt="Asesora de Ventas Mundo"
              fill
              style={{ objectFit: "cover" }}
            />
            <span className="seller-badge">Asesora Oficial</span>
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
