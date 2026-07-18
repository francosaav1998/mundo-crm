"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

/**
 * CountUp — Contador animado (0 → value) cuando entra en viewport.
 *
 * - Usa requestAnimationFrame con easing easeOutExpo (sensación Linear/Stripe).
 * - Solo anima una vez por montaje; si `value` cambia, anima desde el valor anterior.
 * - Respeta prefers-reduced-motion (muestra el valor final directo).
 */
export default function CountUp({ value = 0, duration = 900, formatter = (n) => n.toLocaleString("es-CL") }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(0);
  const prevValue = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!inView || reduced) return;
    const target = Number(value) || 0;

    const from = prevValue.current;
    const start = performance.now();

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplay(Math.round(from + (target - from) * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        prevValue.current = target;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [inView, value, duration, reduced]);

  // Con movimiento reducido, muestra el valor final sin animar
  const shown = reduced ? Number(value) || 0 : display;

  return <span ref={ref}>{formatter(shown)}</span>;
}
