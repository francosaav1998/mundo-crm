"use client";

import { motion } from "framer-motion";
import { STATUS_CONFIG } from "@/lib/dashboard/constants";
import { formatDate } from "@/lib/dashboard/utils";
import { tableRow } from "@/lib/animations";

/**
 * RecentLeads — Tabla con filas que entran en cascada sutil
 * y hover suave por fila.
 */
export default function RecentLeads({ leads, T, onViewAll }) {
  return (
    <div
      className="glass-card"
      style={{
        padding: "28px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 6 }}>Actividad reciente</div>
          <h3 style={{ fontSize: "18px", fontWeight: 700, color: T.text, fontFamily: "var(--font-heading), 'Outfit', sans-serif", letterSpacing: "-0.01em" }}>Leads Recientes</h3>
        </div>
        <button
          onClick={onViewAll}
          className="micro-btn"
          style={{ background: "transparent", border: "none", color: T.accent, fontWeight: 600, fontSize: "13px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}
        >
          Ver todos <i className="bi bi-arrow-right" style={{ fontSize: 12 }} />
        </button>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.border}` }}>
              {["Fecha", "Cliente", "Teléfono", "Comuna", "Plan", "Estado"].map((h) => (
                <th key={h} style={{ padding: "12px 16px", fontSize: "10px", fontWeight: 600, color: T.muted, textTransform: "uppercase", letterSpacing: "0.2em" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.slice(0, 5).map((l, i) => (
              <motion.tr
                key={l.id}
                variants={tableRow}
                initial="hidden"
                animate="visible"
                custom={i}
                className="table-row-hover"
                style={{ borderBottom: `1px solid ${T.border}` }}
              >
                <td style={{ padding: "14px 16px", fontSize: "13px", color: T.text, fontWeight: 500 }}>{formatDate(l.createdAt)}</td>
                <td style={{ padding: "14px 16px", fontSize: "14px", fontWeight: 600, color: T.text, fontFamily: "var(--font-heading), 'Outfit', sans-serif" }}>{l.name}</td>
                <td style={{ padding: "14px 16px", fontSize: "13px", color: T.text, fontWeight: 500 }}>{l.phone}</td>
                <td style={{ padding: "14px 16px", fontSize: "13px", color: T.muted, fontWeight: 500 }}>{l.city}</td>
                <td style={{ padding: "14px 16px", fontSize: "12px" }}>
                  <span style={{ padding: "4px 10px", borderRadius: "9999px", background: `${T.accent}12`, color: T.accent, fontWeight: 600, border: `1px solid ${T.accent}25` }}>
                    {l.plan}
                  </span>
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      padding: "4px 10px",
                      borderRadius: "9999px",
                      background: STATUS_CONFIG[l.status]?.bg,
                      color: STATUS_CONFIG[l.status]?.text,
                      border: `1px solid ${STATUS_CONFIG[l.status]?.text}25`,
                    }}
                  >
                    {l.status}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
