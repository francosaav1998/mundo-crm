"use client";

export default function KpiCards({ kpis, T, isMobile }) {
  const cards = [
    { label: "Total Leads", value: kpis.total, icon: "bi-people-fill", color: T.accent },
    { label: "Pendientes", value: kpis.nuevos, icon: "bi-star-fill", color: T.secondary },
    { label: "En Gestión", value: kpis.contactados, icon: "bi-chat-right-text-fill", color: "#25D366" },
    { label: "Factibles", value: kpis.factibles, icon: "bi-check-circle-fill", color: T.accent4 },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(${isMobile ? "140px" : "200px"}, 1fr))`, gap: isMobile ? 12 : 20, marginBottom: isMobile ? 24 : 40 }}>
      {cards.map((kpi) => (
        <div
          key={kpi.label}
          style={{
            background: T.bgCard,
            border: `1px solid ${T.border}`,
            borderRadius: "20px",
            padding: "24px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            transition: "all 0.3s",
          }}
        >
          <div>
            <span style={{ fontSize: "12px", color: T.muted, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>
              {kpi.label}
            </span>
            <div style={{ fontSize: "36px", fontWeight: 900, color: T.text, marginTop: 8 }}>{kpi.value}</div>
          </div>
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: "14px",
              background: `${kpi.color}20`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `1px solid ${kpi.color}40`,
              boxShadow: `0 0 15px ${kpi.color}30`,
            }}
          >
            <i className={`bi ${kpi.icon}`} style={{ color: kpi.color, fontSize: 20 }} />
          </div>
        </div>
      ))}
    </div>
  );
}
