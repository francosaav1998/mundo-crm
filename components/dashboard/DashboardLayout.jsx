"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

const ALL_MENU_ITEMS = [
  { id: "dashboard", icon: "bi-grid-1x2-fill", label: "Dashboard General" },
  { id: "leads", icon: "bi-people-fill", label: "Clientes y Leads" },
  { id: "emails", icon: "bi-envelope-fill", label: "Correos" },
  { id: "whatsapp", icon: "bi-whatsapp", label: "Mensajes Directos" },
  { id: "import", icon: "bi-file-earmark-spreadsheet-fill", label: "Importar Datos" },
  { id: "landing", icon: "bi-palette-fill", label: "Editor de Landing" },
  { id: "landings", icon: "bi-globe-americas", label: "Landings por Compañía", adminOnly: true },
  { id: "users", icon: "bi-shield-lock-fill", label: "Usuarios", adminOnly: true },
  { id: "settings", icon: "bi-gear-fill", label: "Configuraciones" },
];

const DATE_FILTERS = [
  { id: "todos", label: "Todo" },
  { id: "hoy", label: "Hoy" },
  { id: "ayer", label: "Ayer" },
  { id: "semana", label: "Semana" },
  { id: "mes", label: "Mes" },
  { id: "custom", label: "Otro" },
];

export default function DashboardLayout({
  children,
  activeMenu,
  onMenuChange,
  sidebarOpen,
  setSidebarOpen,
  T,
  theme,
  toggleTheme,
  sellerName,
  username,
  company = null,
  dateFilter,
  setDateFilter,
  customDate,
  setCustomDate,
  isMobile,
  pageTitle,
  isAdmin = false,
  sellerSlug = null,
  onboardingNeeded = false,
}) {
  const router = useRouter();
  const MENU_ITEMS = ALL_MENU_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/dashboard/login");
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: T.bgGradient,
        color: T.text,
        fontFamily: "var(--font-body), 'Plus Jakarta Sans', system-ui, sans-serif",
        position: "relative",
        transition: "background 0.3s, color 0.3s",
      }}
    >
      {/* EducMark Aurora Background */}
      <div className="educmark-bg" />
      <div className="educmark-progress" style={{ width: "100%" }} />

      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="dashboard-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`dashboard-sidebar ${sidebarOpen ? "dashboard-sidebar-open" : ""}`}
        style={{
          background: T.sidebarBg,
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          borderRight: `1px solid ${T.border}`,
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          transition: "width 0.25s cubic-bezier(0.4,0,0.2,1), transform 0.25s cubic-bezier(0.4,0,0.2,1)",
          overflow: "hidden",
          top: 0,
          left: 0,
          height: "100vh",
          zIndex: 10,
        }}
      >
        {/* Logo Section */}
        <div
          style={{
            padding: "24px 20px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            borderBottom: `1px solid ${T.border}`,
            minHeight: 80,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontFamily: "var(--font-heading), 'Outfit', sans-serif",
              fontWeight: 700,
              fontSize: sidebarOpen ? 20 : 16,
              color: T.text,
              letterSpacing: "-0.02em",
              whiteSpace: "nowrap",
            }}
          >
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: `linear-gradient(135deg, ${T.accent} 0%, ${T.secondary} 100%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              <i className="bi bi-globe-americas" />
            </span>
            {sidebarOpen && <span>Mundo</span>}
          </div>
        </div>

        {/* User Info */}
        {sidebarOpen && (
          <div
            style={{
              padding: "16px 20px",
              background: T.inputBg,
              borderBottom: `1px solid ${T.border}`,
              borderRadius: "16px",
              margin: "12px 14px 0",
            }}
          >
            <div style={{ fontSize: "10px", color: T.sidebarMuted, textTransform: "uppercase", letterSpacing: "0.2em", fontWeight: 600 }}>Asesor Comercial</div>
            <div style={{ fontSize: "15px", fontWeight: 700, color: T.sidebarText, marginTop: 6, fontFamily: "var(--font-heading), 'Outfit', sans-serif" }}>{sellerName}</div>
            {company && (
              <div style={{ fontSize: "12px", color: T.accent, fontWeight: 600, marginTop: 4 }}>
                {company.name}
              </div>
            )}
          </div>
        )}

        {/* Nav Links */}
        <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
          {MENU_ITEMS.map((item) => {
            const active = activeMenu === item.id;
            return (
              <div
                key={item.id}
                onClick={() => onMenuChange(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 16px",
                  borderRadius: "14px",
                  cursor: "pointer",
                  background: active ? `${T.accent}15` : "transparent",
                  color: active ? T.accent : T.sidebarMuted,
                  border: active ? `1px solid ${T.accent}35` : "1px solid transparent",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                <i className={`bi ${item.icon}`} style={{ fontSize: 16, color: active ? T.accent : "inherit" }} />
                {sidebarOpen && <span>{item.label}</span>}
              </div>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div style={{ padding: "16px", borderTop: `1px solid ${T.border}`, display: "flex", flexDirection: "column", gap: 8 }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              padding: "8px",
              borderRadius: "10px",
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${T.border}`,
              color: T.sidebarMuted,
              cursor: "pointer",
              fontSize: "12px",
              transition: "all 0.2s",
            }}
          >
            <i className={`bi ${sidebarOpen ? "bi-arrow-bar-left" : "bi-arrow-bar-right"}`} />
          </button>
          {sidebarOpen && (
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                width: "100%",
                padding: "12px 16px",
                borderRadius: "9999px",
                background: `${T.accent}15`,
                border: `1px solid ${T.accent}45`,
                color: T.accent,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 700,
                transition: "all 0.2s",
                textDecoration: "none",
                backdropFilter: "blur(10px)",
              }}
            >
              <i className="bi bi-globe-americas" />
              Ver Landing de Ventas
            </a>
          )}
          {sidebarOpen && (
            <button
              onClick={logout}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                width: "100%",
                padding: "12px 16px",
                borderRadius: "9999px",
                background: "rgba(239, 68, 68, 0.08)",
                border: "1px solid rgba(239, 68, 68, 0.18)",
                color: "#EF4444",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 700,
                transition: "all 0.2s",
              }}
            >
              <i className="bi bi-box-arrow-left" />
              Cerrar Sesión
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, zIndex: 1 }}>
        {/* Top Header */}
        <header
          className="glass-header"
          style={{
            padding: isMobile ? "12px 16px" : "20px 40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              className="dashboard-menu-btn"
              onClick={() => setSidebarOpen(true)}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: `1px solid ${T.border}`,
                color: T.headerText,
                width: 40,
                height: 40,
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: 20,
                flexShrink: 0,
                transition: "all 0.2s",
              }}
            >
              <i className="bi bi-list" />
            </button>
            <div>
              <h1 style={{ fontSize: isMobile ? "18px" : "26px", fontWeight: 700, color: T.headerText, fontFamily: "var(--font-heading), 'Outfit', sans-serif", letterSpacing: "-0.02em" }}>{pageTitle}</h1>
              {!isMobile && (
                <p style={{ fontSize: "13px", color: T.headerMuted, marginTop: 4, fontWeight: 500 }}>
                  Administración y control de cobertura digital en tiempo real.
                </p>
              )}
            </div>
          </div>

          {/* Date filter + Theme Toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={toggleTheme}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: "9999px",
                border: `1px solid ${T.border}`,
                background: "rgba(255,255,255,0.04)",
                color: T.headerText,
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <i className={`bi ${theme === "dark" ? "bi-sun-fill" : "bi-moon-fill"}`}></i>
              <span>{theme === "dark" ? "Día" : "Noche"}</span>
            </button>

            {!isMobile && <span style={{ fontSize: "12px", color: T.headerMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Filtrar Fecha:</span>}
            <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", padding: "4px", borderRadius: "12px", border: `1px solid ${T.border}`, overflowX: "auto", maxWidth: "100%" }}>
              {DATE_FILTERS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setDateFilter(opt.id)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "10px",
                    border: "none",
                    background: dateFilter === opt.id ? `${T.accent}20` : "transparent",
                    color: dateFilter === opt.id ? T.accent : T.headerMuted,
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {dateFilter === "custom" && (
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                style={{
                  background: T.inputBg,
                  border: `1px solid ${T.accent}40`,
                  color: T.text,
                  padding: "8px 12px",
                  borderRadius: "12px",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
            )}
          </div>
        </header>

        {/* Onboarding Banner */}
        {onboardingNeeded && !isAdmin && (
          <div
            className="glass-card"
            style={{
              margin: isMobile ? "0 16px 16px" : "0 40px 24px",
              border: `1px solid ${T.accent}35`,
              padding: "20px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "14px",
                  background: `${T.accent}20`,
                  border: `1px solid ${T.accent}40`,
                  color: T.accent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  flexShrink: 0,
                }}
              >
                <i className="bi bi-rocket-takeoff-fill"></i>
              </div>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: T.text, marginBottom: "4px", fontFamily: "var(--font-heading), 'Outfit', sans-serif" }}>
                  ¡Bienvenida! Tu landing está casi lista
                </h3>
                <p style={{ fontSize: "13px", color: T.muted, fontWeight: 500 }}>
                  Personaliza tu foto, bio y verifica tu WhatsApp para que los clientes te encuentren.
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {sellerSlug && (
                <button
                  onClick={() => router.push(`/p/${sellerSlug}`)}
                  style={{
                    padding: "10px 18px",
                    borderRadius: "9999px",
                    border: `1px solid ${T.border}`,
                    background: "rgba(255,255,255,0.04)",
                    color: T.text,
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <i className="bi bi-eye-fill"></i> Ver mi landing
                </button>
              )}
              <button
                onClick={() => onMenuChange("settings")}
                style={{
                  padding: "10px 20px",
                  borderRadius: "9999px",
                  border: `1px solid ${T.accent}50`,
                  background: `${T.accent}15`,
                  color: T.accent,
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  backdropFilter: "blur(10px)",
                }}
              >
                <i className="bi bi-gear-fill"></i> Configurar ahora
              </button>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main style={{ padding: isMobile ? "16px" : "40px" }}>{children}</main>
      </div>
    </div>
  );
}
