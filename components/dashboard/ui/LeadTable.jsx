"use client";

import { useState, memo } from "react";
import StatusIcons from "./StatusIcons";
import MessageActionButtons from "./MessageActionButtons";
import { formatDate, formatTime } from "@/lib/dashboard/utils";
import { STATUS_CONFIG, ADMIN_STATUS_CONFIG } from "@/lib/dashboard/constants";

function AssignedCell({ lead, isAdmin, T }) {
  const [value, setValue] = useState(lead.assignedTo || "");
  const [saving, setSaving] = useState(false);

  const handleBlur = async () => {
    if (value === (lead.assignedTo || "")) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedTo: value }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setValue(lead.assignedTo || "");
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.target.blur();
    }
  };

  if (!isAdmin) {
    return (
      <span style={{ fontSize: "12px", color: T.muted }}>
        {lead.assignedTo || <span style={{ fontStyle: "italic" }}>Sin asignar</span>}
      </span>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        disabled={saving}
        placeholder="email vendedor"
        style={{
          width: 140,
          padding: "7px 12px",
          background: T.inputBg,
          border: `1px solid ${T.border}`,
          borderRadius: "10px",
          color: T.text,
          fontSize: "12px",
          outline: "none",
          transition: "all 0.2s",
        }}
      />
      {saving && (
        <i
          className="bi bi-arrow-clockwise"
          style={{
            position: "absolute",
            right: 8,
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: 10,
            color: T.muted,
            animation: "spin 1s linear infinite",
          }}
        />
      )}
    </div>
  );
}

const LeadTable = memo(function LeadTable({ leads, onUpdateStatus, updating, loading = false, T, isMobile, isAdmin = false, showToast }) {
  const [sentIds, setSentIds] = useState([]);

  // ── Skeleton rows mientras se cargan/refrescan los leads ──
  if (loading) {
    const cols = isMobile ? 2 : 10;
    return (
      <div style={{ overflowX: "auto" }} aria-busy="true" aria-label="Cargando leads">
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.border}` }}>
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} style={{ padding: isMobile ? "12px 14px" : "16px 20px" }}>
                  <div className="skeleton" style={{ width: "55%", height: 9 }} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }).map((_, r) => (
              <tr key={r} style={{ borderBottom: `1px solid ${T.border}` }}>
                {Array.from({ length: cols }).map((_, c) => (
                  <td key={c} style={{ padding: isMobile ? "14px" : "18px 20px" }}>
                    <div
                      className="skeleton"
                      style={{
                        width: c === 1 ? "70%" : "55%",
                        height: c === 1 ? 14 : 11,
                        opacity: Math.max(1 - r * 0.09, 0.3),
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div style={{ padding: "60px 0", textAlign: "center", color: T.muted }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "20px",
            background: `${T.accent}10`,
            border: `1px solid ${T.accent}25`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
          }}
        >
          <i className="bi bi-inbox" style={{ fontSize: 32, color: T.accent, opacity: 0.8 }} />
        </div>
        <p style={{ marginTop: 16, fontWeight: 600, fontSize: 15 }}>No se encontraron leads para esta búsqueda.</p>
      </div>
    );
  }

  const markSent = (id) => {
    setSentIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const desktopHeaders = ["Fecha", "Cliente", "Teléfono", "Email", "Ciudad/Comuna", "Dirección", "Plan Solicitado", "Asignado a", "Estado", "Acciones"];

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${T.border}` }}>
            {isMobile
              ? ["Cliente", "Estado"].map((h) => (
                  <th key={h} style={{ padding: "12px 14px", fontSize: "10px", fontWeight: 600, color: T.muted, textTransform: "uppercase", letterSpacing: "0.2em" }}>
                    {h}
                  </th>
                ))
              : desktopHeaders.map((h) => (
                  <th key={h} style={{ padding: "16px 20px", fontSize: "10px", fontWeight: 600, color: T.muted, textTransform: "uppercase", letterSpacing: "0.2em" }}>
                    {h}
                  </th>
                ))}
          </tr>
        </thead>
        <tbody>
          {leads.map((lead, rowIndex) => {
            const statusConfig = isAdmin ? ADMIN_STATUS_CONFIG : STATUS_CONFIG;
            const fallbackBadge = { bg: T.inputBg, text: T.muted, icon: "bi-question-circle" };
            const statusIcons = (
              <StatusIcons lead={lead} onUpdate={onUpdateStatus} updating={updating} T={T} isMobile={isMobile} isAdmin={isAdmin} />
            );
            const actions = (
              <MessageActionButtons
                lead={lead}
                T={T}
                showToast={showToast}
                sent={sentIds.includes(lead.id)}
                onSent={() => markSent(lead.id)}
              />
            );

            const currentStatusBadge = (
              <span style={{ fontSize: "10px", fontWeight: 800, padding: "3px 8px", borderRadius: "10px", background: (statusConfig[lead.status] || fallbackBadge).bg, color: (statusConfig[lead.status] || fallbackBadge).text, whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 4 }}>
                <i className={`bi ${(statusConfig[lead.status] || fallbackBadge).icon}`}></i>
                {lead.status}
              </span>
            );

            const rowAnim = {
              animation: "fade-in-up 0.35s cubic-bezier(0.22, 1, 0.36, 1) both",
              animationDelay: `${Math.min(rowIndex * 0.03, 0.4)}s`,
            };

            return isMobile ? (
              <tr key={lead.id} className="table-row-hover" style={{ borderBottom: `1px solid ${T.border}`, transition: "background 0.2s", ...rowAnim }}>
                <td style={{ padding: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: T.text, fontFamily: "var(--font-heading), 'Outfit', sans-serif" }}>{lead.name}</div>
                    {currentStatusBadge}
                  </div>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "#25D366", marginBottom: 4 }}>
                    <i className="bi bi-whatsapp" style={{ marginRight: 4 }} /> +56 {lead.phone}
                  </div>
                  <div style={{ fontSize: "11px", color: T.muted, marginBottom: 10 }}>
                    {lead.plan} · {lead.city}
                  </div>
                  {actions}
                </td>
                <td style={{ padding: "14px", verticalAlign: "top" }}>{statusIcons}</td>
              </tr>
            ) : (
              <tr key={lead.id} className="table-row-hover" style={{ borderBottom: `1px solid ${T.border}`, transition: "background 0.2s", ...rowAnim }}>
                <td style={{ padding: "18px 20px" }}>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: T.text }}>{formatDate(lead.createdAt)}</div>
                  <div style={{ fontSize: "11px", color: T.muted, marginTop: 2 }}>{formatTime(lead.createdAt)}</div>
                </td>
                <td style={{ padding: "18px 20px" }}>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: T.text, fontFamily: "var(--font-heading), 'Outfit', sans-serif" }}>{lead.name}</div>
                  <div style={{ marginTop: 8 }}>{statusIcons}</div>
                </td>
                <td style={{ padding: "18px 20px", fontSize: "13px", fontWeight: 600, color: T.text }}>
                  <i className="bi bi-whatsapp" style={{ color: "#25D366", marginRight: 6 }} /> +56 {lead.phone}
                </td>
                <td style={{ padding: "18px 20px", fontSize: "13px", color: T.text }}>{lead.email || <span style={{ color: T.muted, fontStyle: "italic" }}>—</span>}</td>
                <td style={{ padding: "18px 20px", fontSize: "13px", color: T.muted }}>{lead.city}</td>
                <td style={{ padding: "18px 20px", fontSize: "13px", color: T.muted, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lead.address}</td>
                <td style={{ padding: "18px 20px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 600, padding: "4px 10px", borderRadius: "9999px", background: `${T.accent}15`, color: T.accent, border: `1px solid ${T.accent}30` }}>
                    {lead.plan}
                  </span>
                </td>
                <td style={{ padding: "18px 20px" }}>
                  <AssignedCell lead={lead} isAdmin={isAdmin} T={T} />
                </td>
                <td style={{ padding: "18px 20px" }}>{currentStatusBadge}</td>
                <td style={{ padding: "18px 20px" }}>{actions}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
});

export default LeadTable;
