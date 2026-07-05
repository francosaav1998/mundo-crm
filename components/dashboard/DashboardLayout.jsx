"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

const ALL_MENU_ITEMS = [
  { id: "dashboard", icon: "bi-grid-1x2-fill", label: "Dashboard General" },
  { id: "leads", icon: "bi-people-fill", label: "Clientes y Leads" },
  { id: "emails", icon: "bi-envelope-fill", label: "Correos" },
  { id: "whatsapp", icon: "bi-whatsapp", label: "Mensajes Directos" },
  { id: "import", icon: "bi-file-earmark-spreadsheet-fill", label: "Importar Datos" },
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
        fontFamily: "'Inter', sans-serif",
        position: "relative",
        transition: "background 0.3s, color 0.3s",
      }}
    >
      {/* Background Glows */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: `
            radial-gradient(ellipse 60% 40% at 50% 0%, rgba(0, 229, 255, 0.08) 0%, transparent 70%),
            radial-gradient(circle at 100% 100%, rgba(255, 45, 149, 0.05) 0%, transparent 50%)
          `,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Mobile Sidebar Backdrop */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 9,
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          width: sidebarOpen ? 280 : (isMobile ? 0 : 70),
          background: T.sidebarBg,
          backdropFilter: "blur(20px)",
          borderRight: isMobile ? "none" : `1px solid ${T.border}`,
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
          overflow: "hidden",
          position: isMobile ? "fixed" : "sticky",
          top: 0,
          left: 0,
          height: "100vh",
          zIndex: 10,
          boxShadow: isMobile && sidebarOpen ? "0 0 40px rgba(0,0,0,0.3)" : "none",
        }}
      >
        {/* Logo Section */}
        <div
          style={{
            padding: "24px 20px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
            minHeight: 80,
          }}
        >
          <Image
            src="https://www.tumundo.cl/wp-content/uploads/2022/12/logo-mundo-negative.svg"
            alt="Mundo"
            width={120}
            height={32}
            style={{ height: 32, width: "auto", filter: "brightness(1.2)" }}
          />
        </div>

        {/* User Info */}
        {sidebarOpen && (
          <div style={{ padding: "16px 20px", background: "rgba(255,255,255,0.05)", borderBottom: `1px solid ${T.border}` }}>
            <div style={{ fontSize: "11px", color: T.sidebarMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Asesor Comercial</div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", marginTop: 4 }}>{sellerName}</div>
          </div>
        )}

        {/* Nav Links */}
        <nav style={{ flex: 1, padding: "20px 10px", display: "flex", flexDirection: "column", gap: 6 }}>
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
                  borderRadius: "12px",
                  cursor: "pointer",
                  background: active ? `${T.accent}20` : "transparent",
                  color: active ? T.accent : T.sidebarMuted,
                  border: active ? `1px solid ${T.accent}40` : "1px solid transparent",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                  fontWeight: 600,
                }}
              >
                <i className={`bi ${item.icon}`} style={{ fontSize: 16 }} />
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
              borderRadius: "8px",
              background: "rgba(255,255,255,0.05)",
              border: "none",
              color: T.sidebarMuted,
              cursor: "pointer",
              fontSize: "12px",
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
                gap: 10,
                width: "100%",
                padding: "12px 16px",
                borderRadius: "12px",
                background: `linear-gradient(135deg, ${T.accent} 0%, ${T.accent2} 100%)`,
                border: "none",
                color: "#FFFFFF",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 700,
                transition: "all 0.2s",
                textDecoration: "none",
                boxShadow: T.glowCyan,
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
                gap: 10,
                width: "100%",
                padding: "12px 16px",
                borderRadius: "12px",
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                color: "#EF4444",
                cursor: "pointer",
                fontSize: 14,
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
          style={{
            background: T.headerBg,
            backdropFilter: "blur(20px)",
            borderBottom: `1px solid ${T.border}`,
            padding: isMobile ? "12px 16px" : "20px 40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(true)}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "none",
                  color: T.headerText,
                  width: 40,
                  height: 40,
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontSize: 20,
                  flexShrink: 0,
                }}
              >
                <i className="bi bi-list" />
              </button>
            )}
            <div>
              <h1 style={{ fontSize: isMobile ? "18px" : "24px", fontWeight: 800, color: T.headerText }}>{pageTitle}</h1>
              {!isMobile && (
                <p style={{ fontSize: "13px", color: T.headerMuted, marginTop: 4 }}>
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
                borderRadius: "30px",
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.08)",
                color: T.headerText,
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <i className={`bi ${theme === "dark" ? "bi-sun-fill" : "bi-moon-fill"}`}></i>
              <span>{theme === "dark" ? "Día" : "Noche"}</span>
            </button>

            {!isMobile && <span style={{ fontSize: "13px", color: T.headerMuted, fontWeight: 600 }}>Filtrar Fecha:</span>}
            <div style={{ display: "flex", background: "rgba(255,255,255,0.08)", padding: "4px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.15)", overflowX: "auto", maxWidth: "100%" }}>
              {DATE_FILTERS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setDateFilter(opt.id)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "8px",
                    border: "none",
                    background: dateFilter === opt.id ? T.accent : "transparent",
                    color: dateFilter === opt.id ? "#FFFFFF" : T.headerMuted,
                    fontSize: "12px",
                    fontWeight: 700,
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
                  background: T.bgCard,
                  border: `1px solid ${T.accent}50`,
                  color: T.text,
                  padding: "8px 12px",
                  borderRadius: "10px",
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
            style={{
              margin: isMobile ? "0 16px 16px" : "0 40px 24px",
              background: `linear-gradient(135deg, ${T.accent}15 0%, ${T.accent}05 100%)`,
              border: `2px solid ${T.accent}40`,
              borderRadius: "16px",
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
                  borderRadius: "12px",
                  background: T.accent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  flexShrink: 0,
                }}
              >
                <i className="bi bi-rocket-takeoff-fill"></i>
              </div>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: T.text, marginBottom: "4px" }}>
                  ¡Bienvenida! Tu landing está casi lista
                </h3>
                <p style={{ fontSize: "13px", color: T.muted }}>
                  Personaliza tu foto, bio, video de fondo y verifica tu WhatsApp para que los clientes te encuentren.
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {sellerSlug && (
                <button
                  onClick={() => router.push(`/p/${sellerSlug}`)}
                  style={{
                    padding: "10px 18px",
                    borderRadius: "10px",
                    border: `1px solid ${T.accent}50`,
                    background: "transparent",
                    color: T.text,
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  <i className="bi bi-eye-fill"></i> Ver mi landing
                </button>
              )}
              <button
                onClick={() => onMenuChange("settings")}
                style={{
                  padding: "10px 18px",
                  borderRadius: "10px",
                  border: "none",
                  background: T.accent,
                  color: "#FFFFFF",
                  fontSize: "13px",
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: `0 4px 14px ${T.accent}40`,
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
