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
      style={{
        background: T.bgCard,
        border: `1px solid ${T.border}`,
        borderRadius: "24px",
        padding: "30px",
        boxShadow: "0 0 30px rgba(176,38,255,0.05)",
      }}
    >
      <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: 20, color: T.accent, textShadow: `0 0 10px ${T.accent}40` }}>
        <i className="bi bi-pie-chart-fill" style={{ marginRight: 6 }}></i>
        Planes Más Solicitados
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {planDistribution.slice(0, 4).map((p, i) => {
          const total = planDistribution.reduce((acc, curr) => acc + curr.value, 0);
          const percentage = total > 0 ? ((p.value / total) * 100).toFixed(0) : 0;
          const barColors = [T.accent, T.accent2, T.secondary, T.accent3];
          return (
            <div key={p.name} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ fontWeight: 600, color: T.text }}>{p.name}</span>
                <span style={{ fontWeight: 700, color: barColors[i] }}>{p.value} ({percentage}%)</span>
              </div>
              <div style={{ height: "10px", background: T.inputBg, borderRadius: "6px", overflow: "hidden", position: "relative" }}>
                <div
                  style={{
                    width: `${percentage}%`,
                    height: "100%",
                    background: `linear-gradient(90deg, ${barColors[i]}, ${i < 3 ? T.accent : barColors[i]})`,
                    borderRadius: "6px",
                    boxShadow: `0 0 10px ${barColors[i]}60`,
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
