"use client";

import { STATUSES, ADMIN_STATUSES } from "@/lib/dashboard/constants";
import RippleButton from "@/components/ui/RippleButton";

export default function LeadFilters({ filter, setFilter, search, setSearch, T, isMobile, isAdmin }) {
  const statuses = isAdmin ? ADMIN_STATUSES : STATUSES;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: isMobile ? 16 : 28, alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {["Todos", ...statuses].map((status) => {
          const active = filter === status;
          return (
            <RippleButton
              key={status}
              onClick={() => setFilter(status)}
              style={{
                padding: "7px 14px",
                borderRadius: "9999px",
                fontSize: isMobile ? "11px" : "12px",
                fontWeight: 600,
                border: `1px solid ${active ? `${T.accent}45` : T.border}`,
                background: active ? `${T.accent}15` : "rgba(255,255,255,0.03)",
                color: active ? T.accent : T.muted,
              }}
            >
              {status}
            </RippleButton>
          );
        })}
      </div>

      <div style={{ position: "relative", minWidth: isMobile ? "100%" : 320 }}>
        <i className="bi bi-search" style={{ position: "absolute", left: 14, top: 12, color: T.muted }} />
        <input
          type="text"
          placeholder="Buscar por nombre, comuna o plan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 16px 10px 40px",
            borderRadius: "12px",
            background: T.inputBg,
            border: `1px solid ${T.border}`,
            color: T.text,
            fontSize: "13px",
            outline: "none",
            transition: "all 0.2s",
          }}
        />
      </div>
    </div>
  );
}
