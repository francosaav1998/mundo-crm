"use client";

import { useMemo } from "react";
import { calculatePlanDistribution } from "@/lib/dashboard/utils";

export default function PlanDistribution({ leads, data, T }) {
  const planDistribution = useMemo(() => {
    if (data) return data;
    return calculatePlanDistribution(leads);
  }, [leads, data]);

  return (
    <div
      className="glass-card"
      style={{
        padding: "28px",
      }}
    >
      <div className="eyebrow" style={{ marginBottom: 6 }}>Distribución</div>
      <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: 22, color: T.text, fontFamily: "var(--font-heading), 'Outfit', sans-serif", letterSpacing: "-0.01em" }}>
        Planes Más Solicitados
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {planDistribution.slice(0, 4).map((p, i) => {
          const total = planDistribution.reduce((acc, curr) => acc + curr.value, 0);
          const percentage = total > 0 ? ((p.value / total) * 100).toFixed(0) : 0;
          const barColors = [T.accent, T.accent2, T.secondary, T.accent3];
          const color = barColors[i % barColors.length];
          return (
            <div key={p.name} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ fontWeight: 600, color: T.text }}>{p.name}</span>
                <span style={{ fontWeight: 700, color: color }}>{p.value} ({percentage}%)</span>
              </div>
              <div style={{ height: "10px", background: T.inputBg, borderRadius: "6px", overflow: "hidden", position: "relative" }}>
                <div
                  style={{
                    width: `${percentage}%`,
                    height: "100%",
                    background: `linear-gradient(90deg, ${color}, ${i < 3 ? T.accent : color})`,
                    borderRadius: "6px",
                    boxShadow: `0 0 10px ${color}60`,
                    transition: "width 1s ease",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
