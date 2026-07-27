"use client";

import { useId, useMemo, useState, useCallback } from "react";
import { calculateDailyIntake } from "@/lib/dashboard/utils";

const W = 560;
const H = 220;
const PAD = { top: 16, right: 14, bottom: 30, left: 36 };

// Curva suave (Catmull-Rom → Bézier) para un look profesional tipo analytics.
function buildSmoothPath(points) {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${round(cp1x)} ${round(cp1y)}, ${round(cp2x)} ${round(cp2y)}, ${round(p2.x)} ${round(p2.y)}`;
  }
  return d;
}

function round(n) {
  return Math.round(n * 100) / 100;
}

// Escala "bonita": 1, 2, 2.5, 5 × 10^n para los ticks del eje Y.
function niceCeil(value) {
  if (value <= 1) return 1;
  const exp = Math.floor(Math.log10(value));
  const base = Math.pow(10, exp);
  const f = value / base;
  const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  return nice * base;
}

export default function DailyChart({ leads, data, T }) {
  const baseId = useId();
  const [hoverIndex, setHoverIndex] = useState(null);

  const dailyIntakeData = useMemo(() => {
    if (data) return data;
    return calculateDailyIntake(leads);
  }, [leads, data]);

  const chart = useMemo(() => {
    if (dailyIntakeData.length === 0) return null;
    const maxRaw = Math.max(...dailyIntakeData.map((d) => d.count), 0);
    const maxVal = Math.max(niceCeil(maxRaw || 1), 1);
    const innerW = W - PAD.left - PAD.right;
    const innerH = H - PAD.top - PAD.bottom;
    const stepX = dailyIntakeData.length > 1 ? innerW / (dailyIntakeData.length - 1) : 0;

    const points = dailyIntakeData.map((d, i) => ({
      x: PAD.left + i * stepX,
      y: PAD.top + innerH - (d.count / maxVal) * innerH,
      ...d,
    }));

    const linePath = buildSmoothPath(points);
    const areaPath = `${linePath} L ${round(points[points.length - 1].x)} ${H - PAD.bottom} L ${round(points[0].x)} ${H - PAD.bottom} Z`;

    const ticks = [0, 1, 2, 3, 4].map((i) => {
      const value = (maxVal / 4) * i;
      return {
        value,
        label: Number.isInteger(value) ? String(value) : value.toFixed(1),
        y: PAD.top + innerH - (value / maxVal) * innerH,
      };
    });

    const total = dailyIntakeData.reduce((sum, d) => sum + d.count, 0);
    const peak = Math.max(...dailyIntakeData.map((d) => d.count));

    return { points, linePath, areaPath, ticks, total, peak, maxVal };
  }, [dailyIntakeData]);

  const handleMouseMove = useCallback((event) => {
    if (!chart || chart.points.length === 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * W;
    let nearest = 0;
    let minDist = Infinity;
    chart.points.forEach((p, i) => {
      const dist = Math.abs(p.x - x);
      if (dist < minDist) {
        minDist = dist;
        nearest = i;
      }
    });
    setHoverIndex(nearest);
  }, [chart]);

  const hoverPoint = hoverIndex !== null && chart ? chart.points[hoverIndex] : null;

  return (
    <div
      className="glass-card"
      style={{
        padding: "28px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6, gap: 12, flexWrap: "wrap" }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 6 }}>Tendencia</div>
          <h3 style={{ fontSize: "18px", fontWeight: 700, color: T.text, fontFamily: "var(--font-heading), 'Outfit', sans-serif", letterSpacing: "-0.01em" }}>
            Volumen Diario
          </h3>
        </div>
        {chart && (
          <div style={{ display: "flex", gap: 8 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 999,
                background: `${T.accent}12`,
                border: `1px solid ${T.accent}30`,
                color: T.accent,
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              <i className="bi bi-people-fill" style={{ fontSize: 11 }} />
              {chart.total} leads
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 999,
                background: `${T.secondary}12`,
                border: `1px solid ${T.secondary}30`,
                color: T.secondary,
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              <i className="bi bi-graph-up-arrow" style={{ fontSize: 11 }} />
              Pico {chart.peak}
            </span>
          </div>
        )}
      </div>

      <div style={{ position: "relative", width: "100%", marginTop: 10 }}>
        {chart ? (
          <>
            <svg
              viewBox={`0 0 ${W} ${H}`}
              style={{ width: "100%", height: "auto", display: "block", overflow: "visible", cursor: "crosshair" }}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setHoverIndex(null)}
            >
              <defs>
                <linearGradient id={`${baseId}-areaGrad`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={T.accent} stopOpacity="0.32" />
                  <stop offset="60%" stopColor={T.accent} stopOpacity="0.08" />
                  <stop offset="100%" stopColor={T.accent} stopOpacity="0" />
                </linearGradient>
                <linearGradient id={`${baseId}-lineGrad`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={T.accent2} />
                  <stop offset="55%" stopColor={T.accent} />
                  <stop offset="100%" stopColor={T.secondary} />
                </linearGradient>
                <filter id={`${baseId}-softGlow`} x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Grid horizontal + eje Y */}
              {chart.ticks.map((tick) => (
                <g key={tick.value}>
                  <line
                    x1={PAD.left}
                    y1={tick.y}
                    x2={W - PAD.right}
                    y2={tick.y}
                    stroke={T.border}
                    strokeWidth="1"
                    strokeDasharray={tick.value === 0 ? "0" : "3 5"}
                    opacity={tick.value === 0 ? 0.9 : 0.7}
                  />
                  <text
                    x={PAD.left - 9}
                    y={tick.y + 3.5}
                    fill={T.muted}
                    fontSize="10"
                    fontWeight="600"
                    textAnchor="end"
                  >
                    {tick.label}
                  </text>
                </g>
              ))}

              {/* Área bajo la curva */}
              <path d={chart.areaPath} fill={`url(#${baseId}-areaGrad)`} className="dc-area-fade" />

              {/* Línea principal */}
              <path
                d={chart.linePath}
                fill="none"
                stroke={`url(#${baseId}-lineGrad)`}
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter={`url(#${baseId}-softGlow)`}
                className="dc-line-draw"
              />

              {/* Crosshair */}
              {hoverPoint && (
                <line
                  x1={hoverPoint.x}
                  y1={PAD.top}
                  x2={hoverPoint.x}
                  y2={H - PAD.bottom}
                  stroke={T.accent}
                  strokeWidth="1"
                  strokeDasharray="3 4"
                  opacity="0.55"
                />
              )}

              {/* Puntos */}
              {chart.points.map((p, i) => {
                const isHover = hoverIndex === i;
                return (
                  <g key={i} className="dc-dot-pop" style={{ animationDelay: `${0.7 + i * 0.06}s` }}>
                    {isHover && (
                      <circle cx={p.x} cy={p.y} r="9" fill={T.accent} opacity="0.18" />
                    )}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isHover ? 4.6 : 3}
                      fill={isHover ? T.accent : T.bgCard}
                      stroke={T.accent}
                      strokeWidth="2"
                      style={{ transition: "r 0.15s ease" }}
                    />
                  </g>
                );
              })}

              {/* Etiquetas eje X */}
              {chart.points.map((p, i) => (
                <text
                  key={`lbl-${i}`}
                  x={p.x}
                  y={H - 8}
                  fill={hoverIndex === i ? T.accent : T.muted}
                  fontSize="10"
                  fontWeight={hoverIndex === i ? "800" : "600"}
                  textAnchor="middle"
                >
                  {i % 2 === 0 || chart.points.length < 8 ? p.date : ""}
                </text>
              ))}
            </svg>

            {/* Tooltip */}
            {hoverPoint && (
              <div
                style={{
                  position: "absolute",
                  left: `${(hoverPoint.x / W) * 100}%`,
                  top: `${(hoverPoint.y / H) * 100}%`,
                  transform: `translate(${hoverPoint.x > W * 0.72 ? "-110%" : "-50%"}, -130%)`,
                  background: T.bgCard,
                  border: `1px solid ${T.accent}40`,
                  borderRadius: 12,
                  padding: "8px 12px",
                  boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
                  backdropFilter: "blur(12px)",
                  pointerEvents: "none",
                  whiteSpace: "nowrap",
                  zIndex: 5,
                }}
              >
                <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {hoverPoint.date}
                </div>
                <div style={{ fontSize: 15, color: T.text, fontWeight: 800, marginTop: 2 }}>
                  {hoverPoint.count} {hoverPoint.count === 1 ? "lead" : "leads"}
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 180, color: T.muted, fontSize: 13 }}>
            Sin datos suficientes para graficar.
          </div>
        )}
      </div>
    </div>
  );
}
