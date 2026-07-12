"use client";

export default function Pagination({ page, totalPages, onPageChange, T }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24, flexWrap: "wrap" }}>
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        style={{
          padding: "8px 14px",
          borderRadius: "12px",
          border: `1px solid ${T.border}`,
          background: "rgba(255,255,255,0.03)",
          color: page <= 1 ? T.muted : T.text,
          fontWeight: 600,
          cursor: page <= 1 ? "not-allowed" : "pointer",
          transition: "all 0.2s",
        }}
      >
        <i className="bi bi-chevron-left"></i>
      </button>

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          style={{
            padding: "8px 14px",
            borderRadius: "12px",
            border: `1px solid ${p === page ? `${T.accent}50` : T.border}`,
            background: p === page ? `${T.accent}15` : "rgba(255,255,255,0.03)",
            color: p === page ? T.accent : T.text,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        style={{
          padding: "8px 14px",
          borderRadius: "12px",
          border: `1px solid ${T.border}`,
          background: "rgba(255,255,255,0.03)",
          color: page >= totalPages ? T.muted : T.text,
          fontWeight: 600,
          cursor: page >= totalPages ? "not-allowed" : "pointer",
          transition: "all 0.2s",
        }}
      >
        <i className="bi bi-chevron-right"></i>
      </button>
    </div>
  );
}
