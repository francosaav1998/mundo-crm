"use client";

import { AnimatePresence, motion } from "framer-motion";
import { toastMotion } from "@/lib/animations";

/**
 * AnimatedToast — Notificación flotante con entrada por resorte
 * y salida con fade. Reemplaza al toast estático del dashboard.
 *
 * <AnimatedToast message={toast} T={T} isMobile={isMobile} />
 */
export default function AnimatedToast({ message, T, isMobile = false }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          key="toast"
          variants={toastMotion}
          initial="hidden"
          animate="visible"
          exit="exit"
          style={{
            position: "fixed",
            bottom: isMobile ? 16 : 24,
            right: isMobile ? 16 : 24,
            left: isMobile ? 16 : "auto",
            background: `${T.accent}18`,
            border: `1px solid ${T.accent}45`,
            color: T.accent,
            padding: isMobile ? "12px 16px" : "12px 20px",
            borderRadius: 14,
            fontWeight: 700,
            fontSize: isMobile ? 13 : 14,
            boxShadow: T.glowGold,
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            zIndex: 1000,
            textAlign: isMobile ? "center" : "left",
            display: "flex",
            alignItems: "center",
            justifyContent: isMobile ? "center" : "flex-start",
            gap: 10,
          }}
          role="status"
          aria-live="polite"
        >
          <i className="bi bi-check-circle-fill" style={{ fontSize: 16 }} />
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
