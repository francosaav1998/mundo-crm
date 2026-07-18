"use client";

import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations";

/**
 * SectionHeader — Título + descripción explicativa al inicio de cada sección del dashboard.
 *
 * Props:
 * - eyebrow: etiqueta superior pequeña
 * - title: título principal
 * - description: texto explicativo
 * - T: tema del dashboard
 * - isMobile: boolean
 */
export default function SectionHeader({ eyebrow, title, description, T, isMobile = false }) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      style={{ marginBottom: isMobile ? 18 : 24 }}
    >
      <div className="eyebrow" style={{ marginBottom: 6, color: T.accent }}>{eyebrow}</div>
      <h2
        style={{
          fontSize: isMobile ? "20px" : "clamp(22px, 1.5vw + 18px, 28px)",
          fontWeight: 700,
          color: T.text,
          fontFamily: "var(--font-heading), 'Outfit', sans-serif",
          letterSpacing: "-0.02em",
          marginBottom: 6,
        }}
      >
        {title}
      </h2>
      <p
        style={{
          fontSize: "13px",
          color: T.muted,
          lineHeight: 1.5,
          maxWidth: 680,
        }}
      >
        {description}
      </p>
    </motion.div>
  );
}
