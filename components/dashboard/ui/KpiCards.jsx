"use client";

export default function KpiCards({ kpis, T }) {
  const cards = [
    { label: "Total Leads", value: kpis.total, icon: "bi-people-fill", color: T.accent },
    { label: "Pendientes", value: kpis.nuevos, icon: "bi-star-fill", color: T.secondary },
    { label: "En Gestión", value: kpis.contactados, icon: "bi-chat-right-text-fill", color: "#25D366" },
    { label: "Factibles", value: kpis.factibles, icon: "bi-check-circle-fill", color: T.accent4 },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap: "clamp(12px, 1vw + 6px, 20px)", marginBottom: "clamp(24px, 2vw + 14px, 40px)" }}>
      {cards.map((kpi) => (
        <div
          key={kpi.label}
          className="glass-card"
          style={{
            padding: "clamp(16px, 1vw + 10px, 24px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            transition: "all 0.3s",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <span style={{ fontSize: "clamp(10px, 0.5vw + 8px, 11px)", color: T.muted, textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.15em" }}>
              {kpi.label}
            </span>
            <div style={{ fontSize: "clamp(26px, 1.5vw + 20px, 34px)", fontWeight: 700, color: T.text, marginTop: 8, fontFamily: "var(--font-heading), 'Outfit', sans-serif", letterSpacing: "-0.02em" }}>{kpi.value}</div>
          </div>
          <div
            style={{
              width: "clamp(40px, 2vw + 32px, 50px)",
              height: "clamp(40px, 2vw + 32px, 50px)",
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
            <i className={`bi ${kpi.icon}`} style={{ color: kpi.color, fontSize: "clamp(16px, 1vw + 12px, 20px)" }} />
          </div>
        </div>
      ))}
    </div>
  );
}
