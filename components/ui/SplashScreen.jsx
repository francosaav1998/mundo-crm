"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { EASE_OUT } from "@/lib/animations";

/**
 * SplashScreen — Pantalla de carga premium al ingresar al dashboard.
 *
 * - Logo con entrada scale + glow y anillo expansivo.
 * - Fondo aurora (azul/morado tecnológico) + grid de líneas luminosas sutiles.
 * - Partículas flotantes generadas de forma determinista (sin re-render).
 * - Barra de progreso inferior sincronizada con la duración (1.6s).
 * - La salida (fade + scale) la controla el padre con <AnimatePresence>.
 */

// Partículas pseudo-aleatorias pero deterministas (evita hydration mismatch)
function buildParticles(count) {
  return Array.from({ length: count }, (_, i) => {
    const seed = (i + 1) * 137.508; // golden angle spread
    return {
      id: i,
      left: `${(seed % 97) + 1.5}%`,
      top: `${((seed * 1.61) % 88) + 6}%`,
      size: 2.5 + ((i * 7) % 4),
      delay: (i % 8) * 0.32,
      duration: 2.6 + (i % 5) * 0.35,
    };
  });
}

export default function SplashScreen({ appName = "Mundo CRM", subtitle = "Panel de ventas" }) {
  const particles = useMemo(() => buildParticles(22), []);

  return (
    <motion.div
      className="splash-root"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.06, transition: { duration: 0.5, ease: EASE_OUT } }}
      aria-label="Cargando aplicación"
      role="status"
    >
      <div className="splash-grid-lines" />

      {particles.map((p) => (
        <span
          key={p.id}
          className="splash-particle"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}

      <div style={{ position: "relative", textAlign: "center", zIndex: 2 }}>
        {/* Logo con anillo expansivo */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.55, ease: EASE_OUT }}
          style={{
            position: "relative",
            width: 84,
            height: 84,
            margin: "0 auto 26px",
          }}
        >
          <span className="splash-logo-ring" />
          <span className="splash-logo-ring" style={{ animationDelay: "0.55s" }} />
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 24,
              background: "linear-gradient(135deg, #d4a574 0%, #8080ff 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow:
                "0 0 40px rgba(128,128,255,0.45), 0 0 80px rgba(212,165,116,0.25), 0 20px 50px rgba(0,0,0,0.5)",
            }}
          >
            <motion.i
              className="bi bi-globe-americas"
              style={{ fontSize: 38, color: "#fff" }}
              initial={{ rotate: -30, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.15, ease: EASE_OUT }}
            />
          </div>
        </motion.div>

        {/* Nombre de la app */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.28, ease: EASE_OUT }}
          style={{
            fontSize: "clamp(26px, 3vw, 34px)",
            fontWeight: 700,
            color: "#f0f0f5",
            letterSpacing: "-0.02em",
            fontFamily: "var(--font-heading), 'Outfit', sans-serif",
          }}
        >
          {appName}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.42, ease: EASE_OUT }}
          style={{
            marginTop: 8,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "rgba(158, 158, 255, 0.75)",
          }}
        >
          {subtitle}
        </motion.p>

        {/* Indicador de carga */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.3 }}
          style={{
            marginTop: 30,
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            color: "rgba(240,240,245,0.5)",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          <span className="btn-spinner" style={{ color: "#d4a574" }} />
          Preparando tu espacio de trabajo…
        </motion.div>
      </div>

      {/* Barra de progreso inferior */}
      <div className="splash-progress">
        <div className="splash-progress-fill" />
      </div>
    </motion.div>
  );
}
