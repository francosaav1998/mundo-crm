"use client";

import Image from "next/image";
import { getLogoUrl, shouldInvertLogo } from "@/lib/company";

const NAV_LINKS = [
  { id: "inicio", label: "Inicio" },
  { id: "asesor", label: "Tu Ejecutivo/a" },
  { id: "planes", label: "Planes Hogar" },
  { id: "cobertura", label: "Consultar Cobertura" },
  { id: "beneficios", label: "Beneficios" },
];

export default function Header({ menuOpen, setMenuOpen, onScrollTo, sellerLabels = {}, company = null, content = {} }) {
  const companyName = company?.name || "Mundo";
  const logoUrl = getLogoUrl(company, "header");
  const invertLogo = shouldInvertLogo(company);
  const c = content || {};
  const navLinks = Array.isArray(c.navLinks) && c.navLinks.length > 0 ? c.navLinks : NAV_LINKS;

  return (
    <>
      <div className="header-top">
        <div className="container">
          <div className="header-top-info">
            <span>
              <i className="bi bi-clock-fill"></i> {c.topHours || "Atención Express: Lun a Dom 9:00 a 21:00"}
            </span>
            <span>
              <i className="bi bi-geo-alt-fill"></i> {c.topCoverage || "Cobertura en todo Chile"}
            </span>
          </div>
          <div>
            <span>{sellerLabels.executiveCapitalized || "Ejecutivo/a"} de Ventas Oficial {companyName}</span>
          </div>
        </div>
      </div>

      <header className="site-header">
        <div className="container">
          <nav className="main-nav">
            <a href="#inicio" className="logo" onClick={(e) => { e.preventDefault(); onScrollTo("inicio"); }}>
              <Image
                src={logoUrl}
                alt={`${companyName} Logo`}
                width={120}
                height={40}
                style={{
                  objectFit: "contain",
                  filter: invertLogo ? "brightness(0) invert(1)" : "none",
                }}
              />
            </a>
            <ul className={`nav-links ${menuOpen ? "mobile-active" : ""}`}>
              {navLinks.map((link) => (
                <li key={link.id}>
                  <a
                    href={`#${link.id}`}
                    onClick={(e) => { e.preventDefault(); onScrollTo(link.id); }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <a href={`/politica-de-privacidad?company=${company?.slug || "mundo"}`}>Política de Privacidad</a>
              </li>
            </ul>
            <div className="nav-cta">
              <button onClick={() => onScrollTo("cobertura")} className="btn btn-secondary">
                <i className="bi bi-geo-fill"></i> {c.cta || "Evaluar Factibilidad"}
              </button>
            </div>
            <button
              className="menu-toggle"
              aria-label="Abrir Menú"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <i className={menuOpen ? "bi bi-x-lg" : "bi bi-list"}></i>
            </button>
          </nav>
        </div>
      </header>
    </>
  );
}
