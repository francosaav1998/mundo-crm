"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import RippleButton from "@/components/ui/RippleButton";
import Tooltip from "@/components/ui/Tooltip";
import { buildSellerLandingUrl } from "@/lib/urls";

const BASE_MENU_ITEMS = [
  { id: "dashboard", icon: "bi-grid-1x2-fill", label: "Dashboard General" },
  { id: "leads", icon: "bi-people-fill", label: "Clientes y Leads" },
  { id: "emails", icon: "bi-envelope-fill", label: "Correos" },
  { id: "whatsapp", icon: "bi-whatsapp", label: "Mensajes Directos" },
  { id: "import", icon: "bi-file-earmark-spreadsheet-fill", label: "Importar Datos" },
  { id: "landing", icon: "bi-palette-fill", label: "Editor de Landing" },
  { id: "billing", icon: "bi-credit-card-fill", label: "Facturación", sellerOnly: true },
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

function getMenuItems(isAdmin) {
  if (!isAdmin) return BASE_MENU_ITEMS.filter((item) => !item.adminOnly);
  return BASE_MENU_ITEMS.filter((item) => !item.sellerOnly).map((item) => {
    if (item.id === "leads") return { ...item, label: "Prospectos" };
    if (item.id === "users") return { ...item, label: "Clientes", icon: "bi-people-fill" };
    return item;
  });
}

function getPageDescription({ isAdmin, lockedToBilling }) {
  if (lockedToBilling) return "Activa tu suscripción para volver a operar con normalidad.";
  if (isAdmin) return "Operación, clientes y pipeline comercial desde una sola vista.";
  return "Tus leads, mensajes, landing y seguimiento en una interfaz más simple.";
}

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
  lockedToBilling = false,
}) {
  const router = useRouter();
  let menuItems = getMenuItems(isAdmin).filter((item) => !item.adminOnly || isAdmin);
  if (lockedToBilling) {
    menuItems = menuItems.filter((item) => item.id === "billing");
  }

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/dashboard/login");
  };

  const sellerLandingUrl = sellerSlug ? buildSellerLandingUrl(sellerSlug) : "/";
  const pageDescription = getPageDescription({ isAdmin, lockedToBilling });

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: T.bgGradient,
        color: T.text,
        fontFamily: "var(--font-body), system-ui, sans-serif",
      }}
    >
      {sidebarOpen && isMobile && (
        <div className="dashboard-sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`dashboard-sidebar ${sidebarOpen ? "dashboard-sidebar-open" : ""}`}
        style={{
          background: T.sidebarBg,
          borderRight: `1px solid ${T.border}`,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          zIndex: 20,
        }}
      >
        <div
          style={{
            padding: sidebarOpen ? "22px 20px 18px" : "22px 16px 18px",
            borderBottom: `1px solid ${T.border}`,
            display: "flex",
            alignItems: "center",
            gap: 12,
            minHeight: 78,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 14,
              background: `linear-gradient(135deg, ${T.accent} 0%, ${T.accent2} 100%)`,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: T.glowGold,
            }}
          >
            <i className="bi bi-grid-1x2-fill" />
          </div>
          {sidebarOpen && (
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontFamily: "var(--font-heading), sans-serif",
                  fontWeight: 700,
                  fontSize: 17,
                  letterSpacing: "-0.03em",
                  color: T.sidebarText,
                }}
              >
                GestionVendedores
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: T.sidebarMuted,
                  marginTop: 2,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                CRM Workspace
              </div>
            </div>
          )}
        </div>

        {sidebarOpen && (
          <div
            style={{
              margin: "14px 14px 0",
              padding: "16px 16px 14px",
              borderRadius: 18,
              background: T.inputBg,
              border: `1px solid ${T.border}`,
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: T.sidebarMuted,
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                fontWeight: 600,
              }}
            >
              {isAdmin ? "Administrador" : "Workspace personal"}
            </div>
            <div
              style={{
                fontFamily: "var(--font-heading), sans-serif",
                fontSize: 16,
                fontWeight: 700,
                color: T.sidebarText,
                marginTop: 8,
                letterSpacing: "-0.02em",
              }}
            >
              {sellerName}
            </div>
            <div style={{ fontSize: 12, color: T.sidebarMuted, marginTop: 4 }}>
              {company?.name || username}
            </div>
          </div>
        )}

        <nav
          style={{
            flex: 1,
            padding: "16px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 6,
            overflowY: "auto",
            minHeight: 0,
          }}
        >
          {menuItems.map((item, index) => (
            <MenuItem
              key={item.id}
              item={item}
              index={index}
              active={activeMenu === item.id}
              sidebarOpen={sidebarOpen}
              onClick={() => onMenuChange(item.id)}
              T={T}
            />
          ))}
        </nav>

        <div
          style={{
            padding: "14px 12px 16px",
            borderTop: `1px solid ${T.border}`,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {sidebarOpen && !lockedToBilling && (
            <a
              href={isAdmin ? "/" : sellerLandingUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                width: "100%",
                padding: "11px 14px",
                borderRadius: 14,
                background: `${T.accent}14`,
                border: `1px solid ${T.accent}28`,
                color: T.accent,
                fontSize: 13,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              <i className="bi bi-eye-fill" />
              {isAdmin ? "Ver landing principal" : "Ver mi landing"}
            </a>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <RippleButton
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                flex: sidebarOpen ? "0 0 auto" : 1,
                width: sidebarOpen ? 46 : "100%",
                height: 42,
                borderRadius: 14,
                background: T.inputBg,
                border: `1px solid ${T.border}`,
                color: T.sidebarMuted,
              }}
              aria-label={sidebarOpen ? "Contraer menú" : "Expandir menú"}
            >
              <i className={`bi ${sidebarOpen ? "bi-layout-sidebar-inset" : "bi-layout-sidebar"}`} />
            </RippleButton>

            {sidebarOpen && (
              <RippleButton
                onClick={logout}
                style={{
                  flex: 1,
                  height: 42,
                  borderRadius: 14,
                  background: "rgba(239, 68, 68, 0.08)",
                  border: "1px solid rgba(239, 68, 68, 0.18)",
                  color: "#ef4444",
                  fontSize: 13,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <i className="bi bi-box-arrow-left" />
                <span>Cerrar sesión</span>
              </RippleButton>
            )}
          </div>
        </div>
      </aside>

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="glass-header"
          style={{
            padding: isMobile ? "14px 16px" : "18px 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            <Tooltip content="Abrir menú" position="bottom">
              <RippleButton
                className="dashboard-menu-btn"
                onClick={() => setSidebarOpen((prev) => !(prev ?? !isMobile))}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 14,
                  background: T.inputBg,
                  border: `1px solid ${T.border}`,
                  color: T.headerText,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  flexShrink: 0,
                }}
                aria-label="Abrir menú"
              >
                <i className="bi bi-list" />
              </RippleButton>
            </Tooltip>

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.18em",
                  color: T.headerMuted,
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                {isAdmin ? "Panel administrativo" : "Workspace comercial"}
              </div>
              <h1
                style={{
                  fontSize: isMobile ? 22 : 30,
                  lineHeight: 1.05,
                  fontWeight: 700,
                  color: T.headerText,
                  fontFamily: "var(--font-heading), sans-serif",
                  letterSpacing: "-0.04em",
                }}
              >
                {pageTitle}
              </h1>
              {!isMobile && (
                <p style={{ marginTop: 6, fontSize: 13, color: T.headerMuted, maxWidth: 620 }}>
                  {pageDescription}
                </p>
              )}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {!lockedToBilling && (isAdmin || sellerSlug) && (
              <ActionChip
                onClick={() => window.open(isAdmin ? "/" : sellerLandingUrl, "_blank", "noopener,noreferrer")}
                label={isMobile ? "Landing" : isAdmin ? "Ver landing" : "Ver mi landing"}
                icon="bi-eye-fill"
                T={T}
                accent
              />
            )}

            <ActionChip
              onClick={toggleTheme}
              label={isMobile ? "Tema" : theme === "dark" ? "Modo claro" : "Modo oscuro"}
              icon={theme === "dark" ? "bi-sun-fill" : "bi-moon-fill"}
              T={T}
            />

            {isMobile && (
              <ActionChip onClick={logout} label="Salir" icon="bi-box-arrow-left" T={T} danger />
            )}

            {!isMobile && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: 4,
                  borderRadius: 16,
                  background: T.inputBg,
                  border: `1px solid ${T.border}`,
                  overflowX: "auto",
                  maxWidth: "100%",
                }}
              >
                {DATE_FILTERS.map((opt) => (
                  <RippleButton
                    key={opt.id}
                    onClick={() => setDateFilter(opt.id)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 12,
                      border: "none",
                      background: dateFilter === opt.id ? `${T.accent}18` : "transparent",
                      color: dateFilter === opt.id ? T.accent : T.headerMuted,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {opt.label}
                  </RippleButton>
                ))}
              </div>
            )}

            {dateFilter === "custom" && (
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                style={{
                  height: 40,
                  background: T.inputBg,
                  border: `1px solid ${T.border}`,
                  color: T.text,
                  padding: "0 12px",
                  borderRadius: 12,
                  fontSize: 13,
                  outline: "none",
                }}
              />
            )}
          </div>
        </motion.header>

        {lockedToBilling && (
          <InlineBanner
            T={T}
            tone="danger"
            title="Tu cuenta está pausada"
            text="Registra tu tarjeta para reactivar tu landing automáticamente y volver a operar con normalidad."
            icon="bi-pause-circle-fill"
            isMobile={isMobile}
          />
        )}

        {onboardingNeeded && !isAdmin && (
          <InlineBanner
            T={T}
            tone="accent"
            title="Tu workspace está casi listo"
            text="Sube tu foto, ajusta tu landing y verifica tu WhatsApp para empezar con una presentación más profesional."
            icon="bi-rocket-takeoff-fill"
            isMobile={isMobile}
            actions={
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {sellerSlug && (
                  <ActionChip
                    onClick={() => window.open(sellerLandingUrl, "_blank", "noopener,noreferrer")}
                    label="Ver mi landing"
                    icon="bi-eye-fill"
                    T={T}
                  />
                )}
                <ActionChip
                  onClick={() => onMenuChange("settings")}
                  label="Configurar ahora"
                  icon="bi-gear-fill"
                  T={T}
                  accent
                />
              </div>
            }
          />
        )}

        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25, delay: 0.04 }}
          style={{
            padding: isMobile ? 16 : 28,
            overflowY: "auto",
            flex: 1,
          }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}

function ActionChip({ onClick, label, icon, T, accent = false, danger = false }) {
  const color = danger ? "#ef4444" : accent ? T.accent : T.headerText;
  const background = danger ? "rgba(239, 68, 68, 0.08)" : accent ? `${T.accent}14` : T.inputBg;
  const border = danger ? "1px solid rgba(239, 68, 68, 0.18)" : accent ? `1px solid ${T.accent}28` : `1px solid ${T.border}`;

  return (
    <RippleButton
      onClick={onClick}
      style={{
        height: 40,
        padding: "0 14px",
        borderRadius: 14,
        border,
        background,
        color,
        fontSize: 13,
        fontWeight: 600,
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <i className={`bi ${icon}`} />
      <span>{label}</span>
    </RippleButton>
  );
}

function InlineBanner({ T, tone, title, text, icon, isMobile, actions = null }) {
  const accent = tone === "danger" ? "#ef4444" : T.accent;
  const border = tone === "danger" ? "rgba(239, 68, 68, 0.28)" : `${T.accent}32`;
  const bg = tone === "danger" ? "rgba(239, 68, 68, 0.08)" : `${T.accent}10`;

  return (
    <div
      style={{
        margin: isMobile ? "0 16px 16px" : "0 28px 20px",
        padding: isMobile ? "16px" : "18px 20px",
        borderRadius: 18,
        border: `1px solid ${border}`,
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 220 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            background: `${accent}18`,
            border: `1px solid ${accent}28`,
            color: accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            flexShrink: 0,
          }}
        >
          <i className={`bi ${icon}`} />
        </div>
        <div>
          <h3
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: T.text,
              fontFamily: "var(--font-heading), sans-serif",
              letterSpacing: "-0.02em",
              marginBottom: 4,
            }}
          >
            {title}
          </h3>
          <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.55 }}>{text}</p>
        </div>
      </div>
      {actions}
    </div>
  );
}

const MenuItem = memo(function MenuItem({ item, index, active, sidebarOpen, onClick, T }) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.04 + index * 0.03, duration: 0.24 }}
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        width: "100%",
        padding: sidebarOpen ? "11px 12px" : "11px 0",
        borderRadius: 14,
        cursor: "pointer",
        background: active ? `${T.accent}14` : "transparent",
        color: active ? T.accent : T.sidebarMuted,
        border: active ? `1px solid ${T.accent}28` : "1px solid transparent",
        transition: "all 0.18s ease",
        fontWeight: 600,
        fontSize: 13,
        textAlign: "left",
      }}
    >
      <span
        style={{
          width: 42,
          minWidth: 42,
          height: 42,
          borderRadius: 12,
          background: active ? `${T.accent}12` : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: active ? T.accent : "inherit",
          fontSize: 16,
        }}
      >
        <i className={`bi ${item.icon}`} />
      </span>
      {sidebarOpen && <span style={{ minWidth: 0 }}>{item.label}</span>}
    </motion.button>
  );
});
