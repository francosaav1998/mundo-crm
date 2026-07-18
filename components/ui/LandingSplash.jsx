"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * LandingSplash — Pantalla de carga animada para landings de ventas.
 *
 * - Paleta de marca adaptada a la compañía del vendedor.
 * - Partículas luminosas sutiles y grid de líneas tecnológicas.
 * - Barra de progreso inferior.
 * - Salida fade + scale hacia la landing.
 * - Totalmente responsivo.
 */

function shadeColor(hex, percent) {
  const f = parseInt(hex.slice(1), 16);
  const t = percent < 0 ? 0 : 255;
  const p = Math.abs(percent) / 100;
  const R = f >> 16;
  const G = (f >> 8) & 0x00ff;
  const B = f & 0x0000ff;
  return (
    "#" +
    (
      0x1000000 +
      (Math.round((t - R) * p) + R) * 0x10000 +
      (Math.round((t - G) * p) + G) * 0x100 +
      (Math.round((t - B) * p) + B)
    )
      .toString(16)
      .slice(1)
  );
}

function getSplashTheme(company) {
  if (!company || !company.brandColor) {
    return {
      primary: "#00748E",
      primaryDark: "#005A6F",
      primaryDarker: "#003D4A",
      secondary: "#FDDC02",
      accent: "#FF8000",
      icon: "bi-globe-americas",
      tagline: "Internet Fibra · TV Digital · Telefonía Móvil",
    };
  }
  return {
    primary: company.brandColor,
    primaryDark: company.brandColorDark || shadeColor(company.brandColor, -15),
    primaryDarker: shadeColor(company.brandColor, -30),
    secondary: company.secondaryColor || company.brandColor,
    accent: company.accentColor || company.brandColor,
    icon: company.icon || "bi-globe-americas",
    tagline: company.tagline || "Internet Fibra · TV Digital · Telefonía Móvil",
  };
}

function buildParticles(count) {
  return Array.from({ length: count }, (_, i) => {
    const seed = (i + 1) * 137.508;
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

export default function LandingSplash({ show = true, appName = "Mundo", company = null }) {
  const particles = useMemo(() => buildParticles(20), []);
  const theme = useMemo(() => getSplashTheme(company), [company]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background:
              `radial-gradient(ellipse 90% 60% at 50% -10%, ${hexToRgba(theme.secondary, 0.18)}, transparent 60%), ` +
              `radial-gradient(circle at 120% 20%, ${hexToRgba(theme.secondary, 0.12)}, transparent 45%), ` +
              `radial-gradient(circle at -10% 85%, ${hexToRgba(theme.accent, 0.1)}, transparent 45%), ` +
              `linear-gradient(160deg, ${theme.primaryDarker} 0%, ${theme.primaryDark} 45%, ${theme.primary} 100%)`,
            overflow: "hidden",
            padding: 24,
            textAlign: "center",
          }}
          role="status"
          aria-label="Cargando landing"
        >
          {/* Grid de líneas sutiles */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px), " +
                "linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
              maskImage: "radial-gradient(ellipse 70% 60% at 50% 45%, #000 30%, transparent 75%)",
              WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 45%, #000 30%, transparent 75%)",
            }}
          />

          {/* Partículas */}
          {particles.map((p) => (
            <span
              key={p.id}
              style={{
                position: "absolute",
                left: p.left,
                top: p.top,
                width: p.size,
                height: p.size,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${hexToRgba(theme.secondary, 0.9)} 0%, ${hexToRgba(theme.secondary, 0)} 70%)`,
                filter: "blur(0.5px)",
                opacity: 0,
                animation: "splash-float 3.2s ease-in-out infinite",
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
                willChange: "transform, opacity",
              }}
            />
          ))}

          {/* Logo y texto */}
          <div style={{ position: "relative", zIndex: 2, maxWidth: "90vw" }}>
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: "relative",
                width: "clamp(72px, 20vw, 96px)",
                height: "clamp(72px, 20vw, 96px)",
                margin: "0 auto 24px",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  inset: -12,
                  borderRadius: "24px",
                  border: `1px solid ${hexToRgba(theme.secondary, 0.45)}`,
                  animation: "splash-ring 1.8s cubic-bezier(0.22, 1, 0.36, 1) infinite",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  inset: -12,
                  borderRadius: "24px",
                  border: `1px solid ${hexToRgba(theme.secondary, 0.45)}`,
                  animation: "splash-ring 1.8s cubic-bezier(0.22, 1, 0.36, 1) infinite",
                  animationDelay: "0.55s",
                }}
              />
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "24px",
                  background: `linear-gradient(135deg, ${theme.secondary} 0%, ${theme.accent} 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow:
                    `0 0 40px ${hexToRgba(theme.secondary, 0.35)}, 0 0 80px ${hexToRgba(theme.accent, 0.25)}, 0 20px 50px rgba(0,0,0,0.4)`,
                }}
              >
                <motion.i
                  className={`bi ${theme.icon}`}
                  style={{ fontSize: "clamp(32px, 9vw, 44px)", color: "#fff" }}
                  initial={{ rotate: -30, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontSize: "clamp(24px, 7vw, 36px)",
                fontWeight: 800,
                color: "#fff",
                letterSpacing: "-0.02em",
                fontFamily: "var(--font-heading), 'Outfit', sans-serif",
                marginBottom: 8,
              }}
            >
              {appName}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontSize: "clamp(11px, 3vw, 13px)",
                fontWeight: 600,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "rgba(255, 255, 255, 0.75)",
              }}
            >
              {theme.tagline}
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.3 }}
              style={{
                marginTop: 32,
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                color: "rgba(255,255,255,0.6)",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <span className="btn-spinner" style={{ borderColor: theme.secondary, borderTopColor: "transparent" }} />
              Preparando tu experiencia…
            </motion.div>
          </div>

          {/* Barra de progreso inferior */}
          <div style={{ position: "absolute", bottom: 0, left: 0, height: 3, width: "100%", background: "rgba(255,255,255,0.06)" }}>
            <div
              style={{
                height: "100%",
                background: `linear-gradient(90deg, ${theme.secondary}, ${theme.accent})`,
                boxShadow: `0 0 12px ${hexToRgba(theme.secondary, 0.5)}`,
                animation: "splash-progress-anim 1.6s cubic-bezier(0.4, 0, 0.2, 1) forwards",
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function hexToRgba(hex, alpha) {
  const sanitized = hex.replace("#", "");
  const bigint = parseInt(sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
