"use client";

/**
 * Skeleton — Primitivos de carga con shimmer (definido en globals.css).
 *
 * Uso:
 *   <Skeleton width={120} height={14} />
 *   <SkeletonCard />            → tarjeta glass con líneas
 *   <SkeletonKpis count={4} />  → grid de KPIs
 *   <SkeletonTable rows={8} />  → filas de tabla
 *   <SkeletonChart />           → bloque de gráfico con barras falsas
 */

export default function Skeleton({ width = "100%", height = 14, circle = false, style = {} }) {
  return (
    <div
      className={`skeleton${circle ? " skeleton-circle" : ""}`}
      style={{ width, height, ...style }}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard({ lines = 3, style = {} }) {
  return (
    <div className="glass-card" style={{ padding: 24, ...style }} aria-hidden="true">
      <Skeleton width="42%" height={10} style={{ marginBottom: 14 }} />
      <Skeleton width="70%" height={20} style={{ marginBottom: 20 }} />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={`${88 - i * 12}%`}
          height={11}
          style={{ marginBottom: 10 }}
        />
      ))}
    </div>
  );
}

export function SkeletonKpis({ count = 4 }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))",
        gap: "clamp(12px, 1vw + 6px, 20px)",
        marginBottom: "clamp(24px, 2vw + 14px, 40px)",
      }}
      aria-hidden="true"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="glass-card"
          style={{
            padding: "clamp(16px, 1vw + 10px, 24px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ flex: 1 }}>
            <Skeleton width="55%" height={10} style={{ marginBottom: 12 }} />
            <Skeleton width="40%" height={30} />
          </div>
          <Skeleton width={46} height={46} style={{ borderRadius: 14, flexShrink: 0 }} />
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 6, cols = 6 }) {
  return (
    <div style={{ width: "100%" }} aria-hidden="true">
      {/* Header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: 16,
          padding: "12px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} width="60%" height={9} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: 16,
            padding: "16px",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
            alignItems: "center",
          }}
        >
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton
              key={c}
              width={c === 1 ? "75%" : "55%"}
              height={c === 1 ? 14 : 11}
              style={{ opacity: 1 - r * 0.08 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart() {
  const bars = [42, 68, 35, 80, 55, 90, 62, 74, 48, 85, 58, 70];
  return (
    <div className="glass-card" style={{ padding: 28 }} aria-hidden="true">
      <Skeleton width="30%" height={10} style={{ marginBottom: 12 }} />
      <Skeleton width="45%" height={18} style={{ marginBottom: 26 }} />
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 10,
          height: 130,
          padding: "0 4px",
        }}
      >
        {bars.map((h, i) => (
          <div
            key={i}
            className="skeleton"
            style={{
              flex: 1,
              height: `${h}%`,
              borderRadius: 6,
              animationDelay: `${i * 0.08}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
