"use client";

import { STATUSES, STATUS_CONFIG } from "@/lib/dashboard/constants";
import RippleButton from "@/components/ui/RippleButton";
import Tooltip from "@/components/ui/Tooltip";

export default function StatusIcons({ lead, onUpdate, updating, T, isMobile }) {
  return (
    <div style={{ display: "flex", gap: isMobile ? 4 : 6, flexWrap: "wrap" }}>
      {STATUSES.map((s) => {
        const sc = STATUS_CONFIG[s];
        const isActive = lead.status === s;
        return (
          <Tooltip key={s} content={`Cambiar a: ${s}`} position="top">
            <RippleButton
              onClick={() => onUpdate(lead.id, s)}
              disabled={updating === lead.id}
              loading={updating === lead.id && isActive}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: isMobile ? 2 : 5,
                padding: isMobile ? "5px 6px" : "6px 10px",
                borderRadius: "8px",
                border: isActive ? `1px solid ${sc.text}60` : `1px solid ${T.border}`,
                background: isActive ? sc.bg : "transparent",
                color: isActive ? sc.text : T.muted,
                fontSize: isMobile ? 10 : 11,
                fontWeight: 700,
                opacity: isActive ? 1 : 0.7,
                whiteSpace: "nowrap",
                minWidth: isMobile ? 0 : "auto",
              }}
            >
              <i className={`bi ${sc.icon}`} style={{ fontSize: isMobile ? 11 : 12 }}></i>
              <span style={{ display: isMobile ? "none" : "inline" }}>{s}</span>
            </RippleButton>
          </Tooltip>
        );
      })}
    </div>
  );
}
