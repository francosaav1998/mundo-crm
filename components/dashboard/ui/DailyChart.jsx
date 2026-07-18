"use client";

import { useId, useMemo } from "react";
import { calculateDailyIntake } from "@/lib/dashboard/utils";

export default function DailyChart({ leads, data, T }) {
  const baseId = useId();
  const dailyIntakeData = useMemo(() => {
    if (data) return data;
    return calculateDailyIntake(leads);
  }, [leads, data]);

  const layout = useMemo(() => {
    if (dailyIntakeData.length === 0) return { items: [] };
    const maxVal = Math.max(...dailyIntakeData.map((d) => d.count), 1);
    const width = 500;
    const height = 160;
    const paddingX = 30;
    const paddingY = 20;
    const barWidth = 30;
    const chartContentWidth = width - paddingX * 2;
    const barGap = dailyIntakeData.length > 1 ? chartContentWidth / (dailyIntakeData.length - 1) : 0;

    const items = dailyIntakeData.map((d, index) => {
      const x = paddingX + index * barGap;
      const barHeight = Math.max((d.count * (height - paddingY * 2)) / maxVal, 4);
      const y = height - paddingY - barHeight;
      return { x: x - barWidth / 2, y, barHeight, count: d.count, date: d.date, centerX: x };
    });

    return { items, width, height, barWidth };
  }, [dailyIntakeData]);

  return (
    <div
      className="glass-card"
      style={{
        padding: "28px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 6 }}>Tendencia</div>
          <h3 style={{ fontSize: "18px", fontWeight: 700, color: T.text, fontFamily: "var(--font-heading), 'Outfit', sans-serif", letterSpacing: "-0.01em" }}>
            Volumen Diario
          </h3>
        </div>
      </div>

      <div style={{ position: "relative", width: "100%", height: "170px", marginTop: "10px" }}>
        {layout.items.length > 0 && (
          <svg viewBox={`0 0 ${layout.width} ${layout.height}`} style={{ width: "100%", height: "100%", overflow: "visible" }}>
            <defs>
              <filter id={`${baseId}-neonGlow`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur1" />
                <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur2" />
                <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur3" />
                <feMerge>
                  <feMergeNode in="blur3" />
                  <feMergeNode in="blur2" />
                  <feMergeNode in="blur1" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id={`${baseId}-neonGlowLilac`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur1" />
                <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur2" />
                <feGaussianBlur in="SourceGraphic" stdDeviation="16" result="blur3" />
                <feMerge>
                  <feMergeNode in="blur3" />
                  <feMergeNode in="blur2" />
                  <feMergeNode in="blur1" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id={`${baseId}-barGrad`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={T.accent} stopOpacity="1" />
                <stop offset="50%" stopColor={T.accent} stopOpacity="0.7" />
                <stop offset="100%" stopColor={T.accent2} stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id={`${baseId}-barGradLilac`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={T.secondary} stopOpacity="1" />
                <stop offset="50%" stopColor={T.secondary} stopOpacity="0.7" />
                <stop offset="100%" stopColor="#5a50d6" stopOpacity="0.3" />
              </linearGradient>
            </defs>

            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
              <line
                key={ratio}
                x1="30"
                y1={layout.height - 20 - ratio * (layout.height - 40)}
                x2={layout.width - 30}
                y2={layout.height - 20 - ratio * (layout.height - 40)}
                stroke={T.border}
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            ))}

            {layout.items.map((bar, i) => {
              const maxCount = Math.max(...layout.items.map((b) => b.count));
              const isMax = bar.count === maxCount && maxCount > 0;
              const growDelay = `${i * 0.05}s`;
              return (
                <g key={i}>
                  <rect
                    x={bar.x - 2}
                    y={bar.y - 2}
                    width={layout.barWidth + 4}
                    height={bar.barHeight + 4}
                    rx="8"
                    ry="8"
                    fill={isMax ? T.secondary : T.accent}
                    opacity="0.3"
                    filter={`url(#${baseId}-${isMax ? "neonGlowLilac" : "neonGlow"})`}
                    className="chart-bar-grow"
                    style={{ animationDelay: growDelay }}
                  />
                  <rect
                    x={bar.x}
                    y={bar.y}
                    width={layout.barWidth}
                    height={bar.barHeight}
                    rx="6"
                    ry="6"
                    fill={`url(#${baseId}-${isMax ? "barGradLilac" : "barGrad"})`}
                    className="chart-bar-grow"
                    style={{ transition: "all 0.3s", cursor: "pointer", animationDelay: growDelay }}
                  />
                  <text
                    x={bar.centerX}
                    y={bar.y - 10}
                    fill={isMax ? T.secondary : T.text}
                    fontSize="12px"
                    fontWeight="700"
                    textAnchor="middle"
                    filter={isMax ? `url(#${baseId}-neonGlowLilac)` : "none"}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${0.25 + i * 0.05}s` }}
                  >
                    {bar.count}
                  </text>
                  <rect
                    x={bar.x + 4}
                    y={bar.y + 4}
                    width="4"
                    height={Math.min(bar.barHeight * 0.4, 20)}
                    rx="2"
                    fill="rgba(255,255,255,0.2)"
                    className="chart-bar-grow"
                    style={{ animationDelay: growDelay }}
                  />
                </g>
              );
            })}
          </svg>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", padding: "0 15px", marginTop: "10px" }}>
        {dailyIntakeData.map((d, i) => (
          <span key={d.date} style={{ fontSize: "10px", color: T.muted, fontWeight: 700, letterSpacing: "0.02em" }}>
            {i % 2 === 0 || dailyIntakeData.length < 8 ? d.date : ""}
          </span>
        ))}
      </div>
    </div>
  );
}
