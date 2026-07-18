"use client";

import { useEffect, useMemo, useState } from "react";
import { calculatePlanDistribution } from "@/lib/dashboard/utils";

/**
 * PlanDistribution — Barras de progreso que se animan desde 0
 * hasta su porcentaje al montarse / cambiar los datos.
 */
export default function PlanDistribution({ leads, data, T }) {
  const planDistribution = useMemo(() => {
    if (data) return data;
    return calculatePlanDistribution(leads);
  }, [leads, data]);

  // Las barras nacen en 0 y crecen tras el primer paint (animación CSS).
  // Si los datos cambian después, la transición CSS anima al nuevo ancho.
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setAnimate(true));
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const total = planDistribution.reduce((acc, curr) => acc + curr.value, 0);

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
          const percentage = total > 0 ? ((p.value / total) * 100).toFixed(0) : 0;
          const barColors = [T.accent, T.accent2, T.secondary, T.accent3];
          const color = barColors[i % barColors.length];
          return (
            <div key={p.name} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ fontWeight: 600, color: T.text }}>{p.name}</span>
                <span style={{ fontWeight: 700, color: color, fontVariantNumeric: "tabular-nums" }}>{p.value} ({percentage}%)</span>
              </div>
              <div style={{ height: "10px", background: T.inputBg, borderRadius: "6px", overflow: "hidden", position: "relative" }}>
                <div
                  className="progress-bar-fill"
                  style={{
                    width: animate ? `${percentage}%` : "0%",
                    height: "100%",
                    background: `linear-gradient(90deg, ${color}, ${i < 3 ? T.accent : color})`,
                    borderRadius: "6px",
                    boxShadow: `0 0 10px ${color}60`,
                    transitionDelay: `${i * 0.08}s`,
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
