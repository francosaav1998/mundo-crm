"use client";

import KpiCards from "./ui/KpiCards";
import DailyChart from "./ui/DailyChart";
import PlanDistribution from "./ui/PlanDistribution";
import RecentLeads from "./ui/RecentLeads";
import { useStats } from "./hooks/useStats";

export default function DashboardOverview({ filters, initialStats, T, isMobile, onViewAllLeads }) {
  const { stats, loading, refresh } = useStats({ ...filters, initialStats });

  if (loading || !stats) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
        <div style={{ color: T.muted, fontSize: 14, fontWeight: 700 }}>
          <i className="bi bi-arrow-clockwise" style={{ marginRight: 8, animation: "spin 1s linear infinite" }}></i>
          Cargando estadísticas...
        </div>
      </div>
    );
  }

  const kpis = {
    total: stats.total,
    nuevos: stats.nuevos,
    factibles: stats.factibles,
    contactados: stats.contactados,
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 6 }}>Dashboard General</div>
          <h2 style={{ fontSize: "clamp(22px, 1.5vw + 18px, 28px)", fontWeight: 700, color: T.text, fontFamily: "var(--font-heading), 'Outfit', sans-serif", letterSpacing: "-0.02em" }}>
            Resumen de leads
          </h2>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          style={{
            padding: "8px 16px",
            borderRadius: "9999px",
            border: `1px solid ${T.border}`,
            background: "rgba(255,255,255,0.04)",
            color: T.text,
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            transition: "all 0.2s",
          }}
        >
          <i className={`bi bi-arrow-clockwise ${loading ? "" : ""}`} style={{ animation: loading ? "spin 1s linear infinite" : "none" }}></i>
          {loading ? "Actualizando..." : "Actualizar estadísticas"}
        </button>
      </div>

      <KpiCards kpis={kpis} T={T} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))", gap: "clamp(16px, 1vw + 10px, 30px)", marginBottom: 40 }}>
        <DailyChart data={stats.dailyIntake} T={T} />
        <PlanDistribution data={stats.topPlans} T={T} />
      </div>

      <RecentLeads leads={stats.recent} T={T} onViewAll={onViewAllLeads} />
    </div>
  );
}
