"use client";

import { useCallback, useRef, useState } from "react";

/**
 * RippleButton — Botón con efecto ripple (Material) + micro-interacciones
 * (hover lift, active scale) + estado de carga con spinner integrado.
 *
 * Props extra respecto a <button>:
 * - loading: muestra spinner y deshabilita el botón.
 * - loadingText: texto mientras carga (default: children).
 *
 * Acepta `style`, `className`, `onClick`, `type`, `disabled`, etc.
 */
export default function RippleButton({
  children,
  loading = false,
  loadingText = null,
  className = "",
  style = {},
  disabled = false,
  onClick,
  type = "button",
  ...rest
}) {
  const [ripples, setRipples] = useState([]);
  const idRef = useRef(0);

  const spawnRipple = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const id = idRef.current++;
    setRipples((prev) => [...prev, { id, x, y, size }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);
  }, []);

  const handleClick = useCallback(
    (e) => {
      if (loading || disabled) return;
      spawnRipple(e);
      onClick?.(e);
    },
    [loading, disabled, onClick, spawnRipple]
  );

  return (
    <button
      type={type}
      className={`btn-ripple micro-btn ${className}`}
      style={{ position: "relative", overflow: "hidden", ...style }}
      disabled={disabled || loading}
      onClick={handleClick}
      {...rest}
    >
      {ripples.map((r) => (
        <span
          key={r.id}
          className="ripple-ink"
          style={{ left: r.x, top: r.y, width: r.size, height: r.size }}
        />
      ))}
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          position: "relative",
          zIndex: 1,
        }}
      >
        {loading && <span className="btn-spinner" />}
        {loading && loadingText ? loadingText : children}
      </span>
    </button>
  );
}
