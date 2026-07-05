"use client";

import Image from "next/image";

const NAV_LINKS = [
  { id: "inicio", label: "Inicio" },
  { id: "asesor", label: "Tu Ejecutivo/a" },
  { id: "planes", label: "Planes Hogar" },
  { id: "cobertura", label: "Consultar Cobertura" },
  { id: "beneficios", label: "Beneficios" },
];

export default function Header({ menuOpen, setMenuOpen, onScrollTo, sellerLabels = {} }) {
  return (
    <>
      <div className="header-top">
        <div className="container">
          <div className="header-top-info">
            <span>
              <i className="bi bi-clock-fill"></i> Atención Express: Lun a Dom 9:00 a 21:00
            </span>
            <span>
              <i className="bi bi-geo-alt-fill"></i> Cobertura en todo Chile
            </span>
          </div>
          <div>
            <span>{sellerLabels.executiveCapitalized || "Ejecutivo/a"} de Ventas Oficial Mundo</span>
          </div>
        </div>
      </div>

      <header className="site-header">
        <div className="container">
          <nav className="main-nav">
            <a href="#inicio" className="logo" onClick={(e) => { e.preventDefault(); onScrollTo("inicio"); }}>
              <Image
                src="https://www.tumundo.cl/wp-content/uploads/2022/12/logo-mundo-negative.svg"
                alt="Mundo Logo"
                width={120}
                height={32}
              />
            </a>
            <ul className={`nav-links ${menuOpen ? "mobile-active" : ""}`}>
              {NAV_LINKS.map((link) => (
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
                <a href="/politica-de-privacidad">Política de Privacidad</a>
              </li>
            </ul>
            <div className="nav-cta">
              <button onClick={() => onScrollTo("cobertura")} className="btn btn-secondary">
                <i className="bi bi-geo-fill"></i> Evaluar Factibilidad
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
