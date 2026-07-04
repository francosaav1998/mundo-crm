"use client";

import { STATUS_CONFIG } from "@/lib/dashboard/constants";
import { formatDate } from "@/lib/dashboard/utils";

export default function RecentLeads({ leads, T, onViewAll }) {
  return (
    <div
      style={{
        background: T.bgCard,
        border: `1px solid ${T.border}`,
        borderRadius: "24px",
        padding: "30px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h3 style={{ fontSize: "16px", fontWeight: 700, color: T.accent }}>Leads Recientes</h3>
        <button
          onClick={onViewAll}
          style={{ background: "transparent", border: "none", color: T.secondary, fontWeight: 700, fontSize: "13px", cursor: "pointer" }}
        >
          Ver todos los leads →
        </button>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.border}` }}>
              {["Fecha", "Cliente", "Teléfono", "Comuna", "Plan", "Estado"].map((h) => (
                <th key={h} style={{ padding: "10px 16px", fontSize: "11px", fontWeight: 800, color: T.muted, textTransform: "uppercase" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.slice(0, 5).map((l) => (
              <tr key={l.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                <td style={{ padding: "12px 16px", fontSize: "13px", color: T.text }}>{formatDate(l.createdAt)}</td>
                <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: 700, color: T.text }}>{l.name}</td>
                <td style={{ padding: "12px 16px", fontSize: "13px", color: T.text }}>{l.phone}</td>
                <td style={{ padding: "12px 16px", fontSize: "13px", color: T.muted }}>{l.city}</td>
                <td style={{ padding: "12px 16px", fontSize: "12px" }}>
                  <span style={{ padding: "3px 8px", borderRadius: "6px", background: `${T.accent}20`, color: T.accent, fontWeight: 600 }}>
                    {l.plan}
                  </span>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 800,
                      padding: "3px 8px",
                      borderRadius: "10px",
                      background: STATUS_CONFIG[l.status]?.bg,
                      color: STATUS_CONFIG[l.status]?.text,
                    }}
                  >
                    {l.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
