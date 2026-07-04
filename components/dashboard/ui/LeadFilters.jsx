"use client";

import { STATUSES } from "@/lib/dashboard/constants";

export default function LeadFilters({ filter, setFilter, search, setSearch, T, isMobile }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: isMobile ? 16 : 30, alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {["Todos", ...STATUSES].map((status) => {
          const active = filter === status;
          return (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={{
                padding: "6px 12px",
                borderRadius: "10px",
                fontSize: isMobile ? "11px" : "13px",
                fontWeight: 700,
                cursor: "pointer",
                border: `1px solid ${T.border}`,
                background: active ? T.accent : "rgba(255,255,255,0.03)",
                color: active ? T.bg : T.muted,
                transition: "all 0.2s",
              }}
            >
              {status}
            </button>
          );
        })}
      </div>

      <div style={{ position: "relative", minWidth: isMobile ? "100%" : 280 }}>
        <i className="bi bi-search" style={{ position: "absolute", left: 14, top: 12, color: T.muted }} />
        <input
          type="text"
          placeholder="Buscar por nombre, comuna o plan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 16px 10px 40px",
            borderRadius: "10px",
            background: T.inputBg,
            border: `1px solid ${T.border}`,
            color: T.text,
            fontSize: "13px",
            outline: "none",
          }}
        />
      </div>
    </div>
  );
}
