"use client";

import { useState } from "react";
import StatusIcons from "./StatusIcons";
import { formatDate, formatTime } from "@/lib/dashboard/utils";

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
          padding: "6px 10px",
          background: T.inputBg,
          border: `1px solid ${T.border}`,
          borderRadius: "8px",
          color: T.text,
          fontSize: "12px",
          outline: "none",
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

export default function LeadTable({ leads, onUpdateStatus, updating, T, isMobile, isAdmin = false }) {
  if (leads.length === 0) {
    return (
      <div style={{ padding: "60px 0", textAlign: "center", color: T.muted }}>
        <i className="bi bi-inbox" style={{ fontSize: 40, color: T.muted, opacity: 0.5 }} />
        <p style={{ marginTop: 16, fontWeight: 700 }}>No se encontraron leads para esta búsqueda.</p>
      </div>
    );
  }

  const desktopHeaders = ["Fecha", "Cliente", "Teléfono", "Email", "Ciudad/Comuna", "Dirección", "Plan Solicitado", "Asignado a", "Acción/Estado"];

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${T.border}` }}>
            {isMobile
              ? ["Cliente", "Estado"].map((h) => (
                  <th key={h} style={{ padding: "10px 12px", fontSize: "11px", fontWeight: 800, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    {h}
                  </th>
                ))
              : desktopHeaders.map((h) => (
                  <th key={h} style={{ padding: "14px 20px", fontSize: "11px", fontWeight: 800, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    {h}
                  </th>
                ))}
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => {
            const statusIcons = (
              <StatusIcons lead={lead} onUpdate={onUpdateStatus} updating={updating} T={T} isMobile={isMobile} />
            );

            return isMobile ? (
              <tr key={lead.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                <td style={{ padding: "12px" }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: T.text, marginBottom: 4 }}>{lead.name}</div>
                  <a
                    href={`https://wa.me/56${lead.phone.replace(/\D/g, "").slice(-9)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "12px", fontWeight: 600, color: "#25D366", marginBottom: 8 }}
                  >
                    <i className="bi bi-whatsapp" /> +56 {lead.phone}
                  </a>
                  <div style={{ fontSize: "11px", color: T.muted }}>
                    {lead.plan} · {lead.city}
                  </div>
                </td>
                <td style={{ padding: "12px", verticalAlign: "top" }}>{statusIcons}</td>
              </tr>
            ) : (
              <tr key={lead.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                <td style={{ padding: "20px" }}>
                  <div style={{ fontSize: "13px", fontWeight: 700 }}>{formatDate(lead.createdAt)}</div>
                  <div style={{ fontSize: "11px", color: "#8B9CB8", marginTop: 2 }}>{formatTime(lead.createdAt)}</div>
                </td>
                <td style={{ padding: "20px", fontSize: "14px", fontWeight: 700, color: T.text }}>{lead.name}</td>
                <td style={{ padding: "20px" }}>
                  <a
                    href={`https://wa.me/56${lead.phone.replace(/\D/g, "").slice(-9)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "13px", fontWeight: 700, color: "#25D366" }}
                  >
                    <i className="bi bi-whatsapp" /> +56 {lead.phone}
                  </a>
                </td>
                <td style={{ padding: "20px", fontSize: "13px", color: T.text }}>{lead.email || <span style={{ color: T.muted, fontStyle: "italic" }}>—</span>}</td>
                <td style={{ padding: "20px", fontSize: "13px", color: "#8B9CB8" }}>{lead.city}</td>
                <td style={{ padding: "20px", fontSize: "13px", color: T.muted, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lead.address}</td>
                <td style={{ padding: "20px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, padding: "4px 10px", borderRadius: "8px", background: `${T.accent}20`, color: T.accent }}>
                    {lead.plan}
                  </span>
                </td>
                <td style={{ padding: "20px" }}>
                  <AssignedCell lead={lead} isAdmin={isAdmin} T={T} />
                </td>
                <td style={{ padding: "20px" }}>{statusIcons}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
