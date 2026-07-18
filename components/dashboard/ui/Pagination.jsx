"use client";

import RippleButton from "@/components/ui/RippleButton";

export default function Pagination({ page, totalPages, onPageChange, T }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  const btnBase = {
    padding: "8px 14px",
    borderRadius: "12px",
    borderWidth: "1px",
    borderStyle: "solid",
    fontWeight: 600,
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24, flexWrap: "wrap" }}>
      <RippleButton
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        style={{
          ...btnBase,
          borderColor: T.border,
          background: "rgba(255,255,255,0.03)",
          color: page <= 1 ? T.muted : T.text,
        }}
        aria-label="Página anterior"
      >
        <i className="bi bi-chevron-left"></i>
      </RippleButton>

      {pages.map((p) => (
        <RippleButton
          key={p}
          onClick={() => onPageChange(p)}
          style={{
            ...btnBase,
            borderColor: p === page ? `${T.accent}50` : T.border,
            background: p === page ? `${T.accent}15` : "rgba(255,255,255,0.03)",
            color: p === page ? T.accent : T.text,
          }}
          aria-label={`Ir a página ${p}`}
          aria-current={p === page ? "page" : undefined}
        >
          {p}
        </RippleButton>
      ))}

      <RippleButton
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        style={{
          ...btnBase,
          borderColor: T.border,
          background: "rgba(255,255,255,0.03)",
          color: page >= totalPages ? T.muted : T.text,
        }}
        aria-label="Página siguiente"
      >
        <i className="bi bi-chevron-right"></i>
      </RippleButton>
    </div>
  );
}
