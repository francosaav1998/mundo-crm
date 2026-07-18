"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";

/**
 * FadeIn — Wrapper reutilizable de entrada (fade + slide up).
 *
 * Props:
 * - delay: retardo en segundos (o índice para stagger manual).
 * - y: distancia del slide (default 24).
 * - once: animar solo la primera vez que entra en viewport (default true).
 *
 * <FadeIn>…</FadeIn>
 * <FadeIn delay={2}>…</FadeIn>
 */
export default function FadeIn({ children, delay = 0, y = 24, once = true, style = {}, className = "" }) {
  return (
    <motion.div
      className={className}
      style={style}
      variants={{
        hidden: { opacity: 0, y },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: delay * 0.07 },
        },
      }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-30px" }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Stagger — Contenedor que escalona la entrada de sus hijos <StaggerItem>.
 *
 * <Stagger>
 *   <StaggerItem>…</StaggerItem>
 *   <StaggerItem>…</StaggerItem>
 * </Stagger>
 */
export function Stagger({ children, style = {}, className = "" }) {
  return (
    <motion.div
      className={className}
      style={style}
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-30px" }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, style = {}, className = "" }) {
  return (
    <motion.div className={className} style={style} variants={staggerItem}>
      {children}
    </motion.div>
  );
}

export { fadeInUp };
