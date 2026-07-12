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
          className="glass-card"
          style={{
            padding: isMobile ? "18px" : "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            transition: "all 0.3s",
          }}
        >
          <div>
            <span style={{ fontSize: "11px", color: T.muted, textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.2em" }}>
              {kpi.label}
            </span>
            <div style={{ fontSize: isMobile ? "28px" : "34px", fontWeight: 700, color: T.text, marginTop: 8, fontFamily: "var(--font-heading), 'Outfit', sans-serif", letterSpacing: "-0.02em" }}>{kpi.value}</div>
          </div>
          <div
            style={{
              width: isMobile ? 42 : 50,
              height: isMobile ? 42 : 50,
              borderRadius: "14px",
              background: `${kpi.color}15`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `1px solid ${kpi.color}35`,
              boxShadow: `0 0 18px ${kpi.color}18`,
              flexShrink: 0,
            }}
          >
            <i className={`bi ${kpi.icon}`} style={{ color: kpi.color, fontSize: isMobile ? 18 : 20 }} />
          </div>
        </div>
      ))}
    </div>
  );
}
