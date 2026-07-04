"use client";

import { STATUSES, STATUS_CONFIG } from "@/lib/dashboard/constants";

export default function StatusIcons({ lead, onUpdate, updating, T, isMobile }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
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
              width: isMobile ? 38 : 24,
              height: isMobile ? 38 : 24,
              borderRadius: isMobile ? "10px" : "7px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              border: isActive ? "none" : `1px solid ${T.border}`,
              background: isActive ? sc.bg : "transparent",
              color: isActive ? sc.text : T.muted,
              fontSize: isMobile ? 16 : 11,
              transition: "all 0.15s",
              opacity: isActive ? 1 : 0.55,
            }}
          >
            <i className={`bi ${sc.icon}`}></i>
          </button>
        );
      })}
    </div>
  );
}
