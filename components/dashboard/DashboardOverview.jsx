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
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button
          onClick={refresh}
          disabled={loading}
          style={{
            padding: "8px 14px",
            borderRadius: "10px",
            border: `1px solid ${T.border}`,
            background: "rgba(255,255,255,0.05)",
            color: T.text,
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <i className={`bi bi-arrow-clockwise ${loading ? "" : ""}`} style={{ animation: loading ? "spin 1s linear infinite" : "none" }}></i>
          {loading ? "Actualizando..." : "Actualizar estadísticas"}
        </button>
      </div>

      <KpiCards kpis={kpis} T={T} isMobile={isMobile} />

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 16 : 30, marginBottom: 40 }}>
        <DailyChart data={stats.dailyIntake} T={T} />
        <PlanDistribution data={stats.topPlans} T={T} />
      </div>

      <RecentLeads leads={stats.recent} T={T} onViewAll={onViewAllLeads} />
    </div>
  );
}
