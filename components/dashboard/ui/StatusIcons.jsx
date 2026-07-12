"use client";

import { STATUSES, STATUS_CONFIG } from "@/lib/dashboard/constants";

export default function StatusIcons({ lead, onUpdate, updating, T, isMobile }) {
  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
      {STATUSES.map((s) => {
        const sc = STATUS_CONFIG[s];
        const isActive = lead.status === s;
        return (
          <button
            key={s}
            title={s}
            onClick={() => onUpdate(lead.id, s)}
            disabled={updating === lead.id}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              borderRadius: "8px",
              cursor: "pointer",
              border: isActive ? `1px solid ${sc.text}60` : `1px solid ${T.border}`,
              background: isActive ? sc.bg : "transparent",
              color: isActive ? sc.text : T.muted,
              fontSize: 12,
              fontWeight: 700,
              transition: "all 0.15s",
              opacity: isActive ? 1 : 0.7,
              flexShrink: 0,
            }}
          >
            <i className={`bi ${sc.icon}`} style={{ fontSize: 13 }}></i>
          </button>
        );
      })}
    </div>
  );
}
