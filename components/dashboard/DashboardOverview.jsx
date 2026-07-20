"use client";

import { motion } from "framer-motion";
import KpiCards from "./ui/KpiCards";
import DailyChart from "./ui/DailyChart";
import PlanDistribution from "./ui/PlanDistribution";
import RecentLeads from "./ui/RecentLeads";
import { useStats } from "./hooks/useStats";
import { SkeletonKpis, SkeletonChart, SkeletonTable } from "@/components/ui/Skeleton";
import RippleButton from "@/components/ui/RippleButton";
import { fadeInUp } from "@/lib/animations";

function SellersStrip({ stats, T, onViewClients }) {
  if (!stats || stats.totalSellers === undefined) return null;
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      style={{
        display: "flex",
        gap: 12,
        flexWrap: "wrap",
        marginBottom: 24,
      }}
    >
      {[
        { label: "Vendedores registrados", value: stats.totalSellers, color: T.accent, icon: "bi-people-fill" },
        { label: "Nuevos (7 días)", value: stats.sellersLast7Days, color: "#8080FF", icon: "bi-rocket-takeoff-fill" },
        { label: "Trial vencido", value: stats.trialExpiredSellers, color: "#EF4444", icon: "bi-exclamation-triangle-fill" },
      ].map((k) => (
        <button
          key={k.label}
          onClick={onViewClients}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 16px",
            borderRadius: "16px",
            background: T.inputBg,
            border: `1px solid ${T.border}`,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <div style={{
            width: 34,
            height: 34,
            borderRadius: "10px",
            background: `${k.color}15`,
            color: k.color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
          }}>
            <i className={`bi ${k.icon}`} />
          </div>
          <div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: T.text, lineHeight: 1 }}>{k.value}</div>
            <div style={{ fontSize: "11px", color: T.muted, fontWeight: 600 }}>{k.label}</div>
          </div>
        </button>
      ))}
    </motion.div>
  );
}

export default function DashboardOverview({ filters, initialStats, T, isMobile, onViewAllLeads, isAdmin = false, onViewClients }) {
  const { stats, loading, refresh } = useStats({ ...filters, initialStats });

  // ── Skeletons mientras llegan los datos (sin spinners vacíos) ──
  if (loading || !stats) {
    return (
      <div aria-busy="true" aria-label="Cargando estadísticas">
        <div style={{ marginBottom: 24 }}>
          <div className="skeleton" style={{ width: 140, height: 10, marginBottom: 12 }} />
          <div className="skeleton" style={{ width: 220, height: 26 }} />
        </div>
        <SkeletonKpis count={4} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))",
            gap: "clamp(16px, 1vw + 10px, 30px)",
            marginBottom: 40,
          }}
        >
          <SkeletonChart />
          <SkeletonChart />
        </div>
        <div className="glass-card" style={{ padding: 28 }}>
          <SkeletonTable rows={5} cols={6} />
        </div>
      </div>
    );
  }

  const kpis = isAdmin
    ? {
        total: stats.total,
        nuevos: stats.nuevos,
        interesados: stats.interesados || 0,
        activos: stats.clientesActivos || 0,
      }
    : {
        total: stats.total,
        nuevos: stats.nuevos,
        factibles: stats.factibles,
        contactados: stats.contactados,
      };

  return (
    <div>
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, flexWrap: "wrap", gap: 12 }}
      >
        <div>
          <div className="eyebrow" style={{ marginBottom: 6 }}>Dashboard General</div>
          <h2 style={{ fontSize: "clamp(22px, 1.5vw + 18px, 28px)", fontWeight: 700, color: T.text, fontFamily: "var(--font-heading), 'Outfit', sans-serif", letterSpacing: "-0.02em" }}>
            {isAdmin ? "Pipeline de vendedores" : "Resumen de leads"}
          </h2>
        </div>
        <RippleButton
          onClick={refresh}
          disabled={loading}
          loading={loading}
          loadingText="Actualizando..."
          style={{
            padding: "8px 16px",
            borderRadius: "9999px",
            border: `1px solid ${T.border}`,
            background: "rgba(255,255,255,0.04)",
            color: T.text,
            fontSize: "12px",
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <i className="bi bi-arrow-clockwise"></i>
          Actualizar estadísticas
        </RippleButton>
      </motion.div>

      {/* KPIs con contadores animados y entrada escalonada */}
      {isAdmin && <SellersStrip stats={stats} T={T} onViewClients={onViewClients} />}
      <KpiCards kpis={kpis} T={T} isAdmin={isAdmin} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))", gap: "clamp(16px, 1vw + 10px, 30px)", marginBottom: 40 }}>
        <motion.div variants={fadeInUp} custom={1} initial="hidden" animate="visible">
          <DailyChart data={stats.dailyIntake} T={T} />
        </motion.div>
        <motion.div variants={fadeInUp} custom={2} initial="hidden" animate="visible">
          <PlanDistribution data={stats.topPlans} T={T} />
        </motion.div>
      </div>

      <motion.div variants={fadeInUp} custom={3} initial="hidden" animate="visible">
        <RecentLeads leads={stats.recent} T={T} onViewAll={onViewAllLeads} />
      </motion.div>
    </div>
  );
}
