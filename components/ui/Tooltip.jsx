"use client";

import { useState, useRef, useEffect, useCallback, useId } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/**
 * Tooltip — Etiqueta flotante con animación suave (fade + scale).
 *
 * Envuelve el hijo en un inline-flex para medir su posición sin modificar
 * el árbol de refs del children. Ideal para botones, iconos y enlaces.
 *
 * Uso:
 *   <Tooltip content="Guardar cambios">
 *     <button>Guardar</button>
 *   </Tooltip>
 *
 * Props:
 * - content: texto o nodo a mostrar.
 * - position: "top" | "bottom" | "left" | "right" (default: "top").
 * - delay: retardo antes de mostrar (ms, default: 220).
 * - offset: distancia en px (default: 8).
 */
export default function Tooltip({
  children,
  content,
  position = "top",
  delay = 220,
  offset = 8,
}) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const timerRef = useRef(null);
  const id = useId();
  const reduced = useReducedMotion();

  const computePosition = useCallback(() => {
    const trigger = triggerRef.current;
    const tooltip = tooltipRef.current;
    if (!trigger || !tooltip) return;

    const rect = trigger.getBoundingClientRect();
    const tipRect = tooltip.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    let top = 0;
    let left = 0;

    switch (position) {
      case "top":
        top = rect.top + scrollY - tipRect.height - offset;
        left = rect.left + scrollX + rect.width / 2 - tipRect.width / 2;
        break;
      case "bottom":
        top = rect.bottom + scrollY + offset;
        left = rect.left + scrollX + rect.width / 2 - tipRect.width / 2;
        break;
      case "left":
        top = rect.top + scrollY + rect.height / 2 - tipRect.height / 2;
        left = rect.left + scrollX - tipRect.width - offset;
        break;
      case "right":
        top = rect.top + scrollY + rect.height / 2 - tipRect.height / 2;
        left = rect.right + scrollX + offset;
        break;
      default:
        break;
    }

    // Ajustes de viewport para evitar desbordes
    const padding = 8;
    const maxLeft = window.innerWidth - tipRect.width - padding;
    const maxTop = window.innerHeight - tipRect.height - padding;
    left = Math.max(padding, Math.min(left, maxLeft));
    top = Math.max(padding, Math.min(top, maxTop));

    setCoords({ top, left });
  }, [offset, position]);

  const show = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setVisible(true);
      computePosition();
    }, delay);
  }, [delay, computePosition]);

  const hide = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
  }, []);

  useEffect(() => {
    if (visible) computePosition();
  }, [visible, computePosition]);

  useEffect(() => {
    const handleScroll = () => visible && computePosition();
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible, computePosition]);

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        aria-describedby={visible ? `tooltip-${id}` : undefined}
        style={{ display: "inline-flex", verticalAlign: "middle" }}
      >
        {children}
      </span>
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {visible && content && (
              <motion.div
                id={`tooltip-${id}`}
                ref={tooltipRef}
                role="tooltip"
                initial={{ opacity: 0, scale: reduced ? 1 : 0.92, y: reduced ? 0 : position === "top" ? 4 : position === "bottom" ? -4 : 0 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: position === "top" ? 2 : position === "bottom" ? -2 : 0 }}
                transition={{ duration: reduced ? 0.05 : 0.18, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  position: "absolute",
                  top: coords.top,
                  left: coords.left,
                  zIndex: 9999,
                  pointerEvents: "none",
                  maxWidth: 260,
                  padding: "8px 12px",
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 600,
                  lineHeight: 1.4,
                  background: "rgba(15, 15, 26, 0.92)",
                  color: "#f0f0f5",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  whiteSpace: "normal",
                  textAlign: "center",
                }}
              >
                {content}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
