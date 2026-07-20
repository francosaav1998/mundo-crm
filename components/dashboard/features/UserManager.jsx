"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import RippleButton from "@/components/ui/RippleButton";
import SectionHeader from "@/components/dashboard/ui/SectionHeader";

const TRIAL_DAYS = 7;
const FILTERS = [
  { id: "todos", label: "Todos" },
  { id: "activo", label: "Trial activo" },
  { id: "vencido", label: "Trial vencido" },
  { id: "inactivo", label: "Inactivos" },
  { id: "noconfig", label: "Sin configurar" },
];

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "2-digit" });
}

function getWhatsAppUrl(phone) {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, "");
  if (!digits) return null;
  // El modelo Seller guarda teléfonos normalizados como 569XXXXXXXX
  return `https://wa.me/${digits.startsWith("56") ? digits : `56${digits}`}`;
}

function TrialBadge({ daysActive, T }) {
  let color = "#10B981";
  let bg = "rgba(16, 185, 129, 0.1)";
  let label = `Día ${daysActive} de ${TRIAL_DAYS}`;
  if (daysActive >= TRIAL_DAYS) {
    color = "#EF4444";
    bg = "rgba(239, 68, 68, 0.1)";
    label = `Vencido hace ${daysActive - TRIAL_DAYS} día${daysActive - TRIAL_DAYS === 1 ? "" : "s"}`;
  } else if (daysActive >= TRIAL_DAYS - 2) {
    color = "#F59E0B";
    bg = "rgba(245, 158, 11, 0.12)";
  }
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "6px 12px",
      borderRadius: "9999px",
      background: bg,
      border: `1px solid ${color}40`,
      color,
      fontSize: "12px",
      fontWeight: 800,
      whiteSpace: "nowrap",
    }}>
      <i className="bi bi-clock-history" style={{ fontSize: 12 }} />
      {label}
    </span>
  );
}

function KpiStat({ icon, label, value, color, T }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "14px 16px",
      borderRadius: "16px",
      background: T.inputBg,
      border: `1px solid ${T.border}`,
    }}>
      <div style={{
        width: 38,
        height: 38,
        borderRadius: "10px",
        background: `${color}15`,
        color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 18,
      }}>
        <i className={`bi ${icon}`} />
      </div>
      <div>
        <div style={{ fontSize: "20px", fontWeight: 800, color: T.text, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: "11px", color: T.muted, fontWeight: 600, marginTop: 2 }}>{label}</div>
      </div>
    </div>
  );
}

export default function UserManager({ T, isMobile, showToast }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("todos");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/users")
      .then((res) => {
        if (!res.ok) throw new Error("No autorizado o error del servidor");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setUsers(data);
      })
      .catch((err) => {
        if (!cancelled) showToast?.(err.message || "Error cargando clientes");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [showToast]);

  const toggleActive = async (seller) => {
    if (!seller?.id) return;
    setToggling(seller.id);
    try {
      const res = await fetch("/api/sellers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: seller.id, active: !seller.active }),
      });
      if (!res.ok) throw new Error("Error al cambiar estado");
      const updated = await res.json();
      setUsers((prev) =>
        prev.map((u) =>
          u.seller?.id === updated.id
            ? { ...u, seller: { ...u.seller, active: updated.active } }
            : u
        )
      );
      showToast?.(updated.active ? "Landing activada" : "Landing desactivada");
    } catch (err) {
      showToast?.(err.message);
    } finally {
      setToggling(null);
    }
  };

  const copyRegistroLink = () => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/registro` : "/registro";
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      });
    }
  };

  const filtered = useMemo(() => {
    let list = users;
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (u) =>
          u.email?.toLowerCase().includes(q) ||
          u.seller?.name?.toLowerCase().includes(q) ||
          u.seller?.company?.toLowerCase().includes(q) ||
          u.seller?.slug?.toLowerCase().includes(q)
      );
    }
    switch (filter) {
      case "activo":
        return list.filter((u) => u.seller?.landingUrl && !u.seller?.trialExpired);
      case "vencido":
        return list.filter((u) => u.seller?.landingUrl && u.seller?.trialExpired);
      case "inactivo":
        return list.filter((u) => u.seller?.landingUrl && !u.seller?.active);
      case "noconfig":
        return list.filter((u) => !u.seller?.landingUrl);
      default:
        return list;
    }
  }, [users, search, filter]);

  const stats = useMemo(() => {
    const configured = users.filter((u) => u.seller?.landingUrl);
    const activeTrials = configured.filter((u) => !u.seller?.trialExpired).length;
    const expiredTrials = configured.filter((u) => u.seller?.trialExpired).length;
    const inactive = configured.filter((u) => !u.seller?.active).length;
    return {
      total: users.length,
      activeTrials,
      expiredTrials,
      inactive,
    };
  }, [users]);

  const cardStyle = {
    background: T.bgCard,
    border: `1px solid ${T.border}`,
    borderRadius: "24px",
    padding: isMobile ? "20px" : "30px",
    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.2)",
    backdropFilter: "blur(20px)",
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    background: T.inputBg,
    border: `1px solid ${T.border}`,
    borderRadius: "12px",
    color: T.text,
    fontSize: "14px",
    outline: "none",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <SectionHeader
        eyebrow="Clientes"
        title="Vendedores registrados"
        description="Gestiona tus vendedores: días de trial, contacto rápido y activación de su landing. Cada usuario debe registrarse con su correo en /registro."
        T={T}
        isMobile={isMobile}
      />

      {/* Link copiable + KPIs */}
      <div style={cardStyle}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: T.text, marginBottom: 4 }}>
                <i className="bi bi-link-45deg" style={{ marginRight: 8, color: T.accent }} />
                Link de registro para vendedores
              </h3>
              <p style={{ fontSize: "13px", color: T.muted }}>
                Comparte este enlace para que cada vendedor se registre con su propio correo.
              </p>
            </div>
            <RippleButton
              onClick={copyRegistroLink}
              style={{
                padding: "10px 18px",
                borderRadius: "9999px",
                border: `1px solid ${T.accent}50`,
                background: `${T.accent}15`,
                color: T.accent,
                fontSize: "13px",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <i className={`bi ${copied ? "bi-check-lg" : "bi-copy"}`} />
              {copied ? "Copiado" : "Copiar link"}
            </RippleButton>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
            gap: 12,
          }}>
            <KpiStat icon="bi-people-fill" label="Total vendedores" value={stats.total} color={T.accent} T={T} />
            <KpiStat icon="bi-hourglass-split" label="Trial activo" value={stats.activeTrials} color="#10B981" T={T} />
            <KpiStat icon="bi-exclamation-triangle-fill" label="Trial vencido" value={stats.expiredTrials} color="#EF4444" T={T} />
            <KpiStat icon="bi-pause-circle-fill" label="Inactivos" value={stats.inactive} color="#F59E0B" T={T} />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        gap: 12,
        alignItems: isMobile ? "stretch" : "center",
      }}>
        <div style={{ position: "relative", flex: 1, maxWidth: isMobile ? "100%" : "360px" }}>
          <i className="bi bi-search" style={{
            position: "absolute",
            left: 14,
            top: "50%",
            transform: "translateY(-50%)",
            color: T.muted,
            fontSize: 14,
          }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, email, compañía o slug"
            style={{ ...inputStyle, paddingLeft: 40 }}
          />
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {FILTERS.map((f) => (
            <RippleButton
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                padding: "8px 14px",
                borderRadius: "9999px",
                border: "none",
                background: filter === f.id ? `${T.accent}20` : T.inputBg,
                color: filter === f.id ? T.accent : T.muted,
                fontSize: "12px",
                fontWeight: 700,
                border: filter === f.id ? `1px solid ${T.accent}40` : `1px solid ${T.border}`,
              }}
            >
              {f.label}
            </RippleButton>
          ))}
        </div>
      </div>

      {/* Lista */}
      <div style={cardStyle}>
        <h2 style={{
          fontSize: "18px",
          fontWeight: 800,
          color: T.accent,
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}>
          <i className="bi bi-people-fill" />
          Clientes ({filtered.length})
        </h2>

        {loading ? (
          <div style={{ color: T.muted, fontSize: "14px", padding: "20px 0" }}>
            <i className="bi bi-arrow-clockwise" style={{ marginRight: 8, animation: "spin 1s linear infinite" }} />
            Cargando vendedores...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px 0", color: T.muted }}>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: "20px",
              background: `${T.accent}10`,
              border: `1px solid ${T.accent}25`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}>
              <i className="bi bi-inbox" style={{ fontSize: 32, color: T.accent, opacity: 0.8 }} />
            </div>
            <p style={{ fontWeight: 600, fontSize: 15 }}>No se encontraron vendedores con este filtro.</p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 16,
          }}>
            {filtered.map((u, idx) => {
              const seller = u.seller;
              const hasSeller = Boolean(seller?.landingUrl);
              const whatsappUrl = getWhatsAppUrl(seller?.phone);
              const isInactive = hasSeller && !seller.active;
              return (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.04, 0.4), duration: 0.3 }}
                  style={{
                    padding: 20,
                    borderRadius: 20,
                    background: T.inputBg,
                    border: `1px solid ${isInactive ? "rgba(239, 68, 68, 0.35)" : T.border}`,
                    opacity: isInactive ? 0.85 : 1,
                  }}
                >
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 12,
                    marginBottom: 14,
                  }}>
                    <div>
                      <div style={{ fontSize: "16px", fontWeight: 700, color: T.text, fontFamily: "var(--font-heading), 'Outfit', sans-serif" }}>
                        {seller?.name || "Sin nombre"}
                      </div>
                      <div style={{ fontSize: "12px", color: T.muted, marginTop: 2 }}>
                        {u.email}
                      </div>
                    </div>
                    {hasSeller ? (
                      <button
                        onClick={() => toggleActive(seller)}
                        disabled={toggling === seller.id}
                        style={{
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          padding: 4,
                          color: seller.active ? "#10B981" : "#EF4444",
                          fontSize: 20,
                          display: "flex",
                          alignItems: "center",
                          opacity: toggling === seller.id ? 0.6 : 1,
                        }}
                        title={seller.active ? "Desactivar landing" : "Activar landing"}
                        aria-label={seller.active ? "Desactivar landing" : "Activar landing"}
                      >
                        <i className={`bi ${toggling === seller.id ? "bi-arrow-clockwise" : (seller.active ? "bi-toggle-on" : "bi-toggle-off")}`} />
                      </button>
                    ) : (
                      <span style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        padding: "4px 8px",
                        borderRadius: "8px",
                        background: "rgba(148, 163, 184, 0.15)",
                        color: "#94A3B8",
                        border: "1px solid rgba(148, 163, 184, 0.25)",
                      }}>
                        Sin configurar
                      </span>
                    )}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "13px", color: T.muted }}>
                      <i className="bi bi-building" />
                      {seller?.company || "Sin compañía"}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "13px", color: T.muted }}>
                      <i className="bi bi-whatsapp" style={{ color: "#25D366" }} />
                      {seller?.phone || "—"}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "13px", color: T.muted }}>
                      <i className="bi bi-calendar3" />
                      Registro: {formatDate(u.createdAt)}
                    </div>
                    {hasSeller && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "13px", color: T.muted }}>
                        <i className="bi bi-bar-chart-line" />
                        {seller.leadsCount} lead{seller.leadsCount === 1 ? "" : "s"} captado{seller.leadsCount === 1 ? "" : "s"}
                      </div>
                    )}
                  </div>

                  {hasSeller ? (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                      <TrialBadge daysActive={seller.daysActive} T={T} />
                    </div>
                  ) : (
                    <div style={{
                      fontSize: "12px",
                      color: "#94A3B8",
                      background: "rgba(148, 163, 184, 0.1)",
                      border: "1px solid rgba(148, 163, 184, 0.2)",
                      padding: "10px 12px",
                      borderRadius: "12px",
                      marginBottom: 14,
                    }}>
                      <i className="bi bi-info-circle" style={{ marginRight: 6 }} />
                      Se registró pero aún no ha configurado su landing.
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {seller?.landingUrl && (
                      <a
                        href={seller.landingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          flex: 1,
                          minWidth: 110,
                          padding: "10px 14px",
                          borderRadius: "12px",
                          background: `${T.accent}15`,
                          border: `1px solid ${T.accent}40`,
                          color: T.accent,
                          fontSize: "13px",
                          fontWeight: 700,
                          textDecoration: "none",
                          textAlign: "center",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                        }}
                      >
                        <i className="bi bi-globe" />
                        Ver landing
                      </a>
                    )}
                    {whatsappUrl ? (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          flex: 1,
                          minWidth: 110,
                          padding: "10px 14px",
                          borderRadius: "12px",
                          background: "rgba(37, 211, 102, 0.12)",
                          border: "1px solid rgba(37, 211, 102, 0.35)",
                          color: "#25D366",
                          fontSize: "13px",
                          fontWeight: 700,
                          textDecoration: "none",
                          textAlign: "center",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                        }}
                      >
                        <i className="bi bi-whatsapp" />
                        WhatsApp
                      </a>
                    ) : (
                      <span style={{
                        flex: 1,
                        minWidth: 110,
                        padding: "10px 14px",
                        borderRadius: "12px",
                        background: T.inputBg,
                        border: `1px solid ${T.border}`,
                        color: T.muted,
                        fontSize: "13px",
                        fontWeight: 700,
                        textAlign: "center",
                      }}>
                        Sin WhatsApp
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
