/**
 * Variants compartidos de Framer Motion para todo el CRM.
 *
 * Convenciones:
 * - `EaseOut` suave tipo Linear/Stripe en todas las entradas.
 * - Duraciones cortas (0.2–0.45s) para que la app se sienta rápida.
 * - Todos los componentes que los usan respetan `prefers-reduced-motion`
 *   (framer-motion lo respeta vía MotionConfig reducedMotion="user").
 */

export const EASE_OUT = [0.22, 1, 0.36, 1];
export const EASE_SNAP = [0.4, 0, 0.2, 1];

/** Entrada de tarjetas/secciones: fade + slide up */
export const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE_OUT, delay: i * 0.07 },
  }),
};

/** Entrada simple con fade (headers, textos) */
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.35, ease: EASE_OUT } },
};

/** Contenedor que escalona la entrada de sus hijos */
export const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

/** Item hijo de staggerContainer */
export const staggerItem = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT } },
};

/** Modales: scale + fade con salida elegante */
export const modalOverlay = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.22, ease: EASE_OUT } },
  exit: { opacity: 0, transition: { duration: 0.18, ease: "easeIn" } },
};

export const modalContent = {
  hidden: { opacity: 0, scale: 0.94, y: 16 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.3, ease: EASE_OUT },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 10,
    transition: { duration: 0.18, ease: "easeIn" },
  },
};

/** Transición entre tabs/vistas del dashboard */
export const pageTransition = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: EASE_OUT } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15, ease: "easeIn" } },
};

/** Toast: entra desde abajo a la derecha con resorte suave */
export const toastMotion = {
  hidden: { opacity: 0, y: 24, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 380, damping: 28 },
  },
  exit: { opacity: 0, y: 12, scale: 0.96, transition: { duration: 0.2 } },
};

/** Splash screen: salida fade + scale hacia el dashboard */
export const splashExit = {
  opacity: 0,
  scale: 1.06,
  transition: { duration: 0.5, ease: EASE_OUT },
};

/** Filas de tablas: cascada sutil */
export const tableRow = {
  hidden: { opacity: 0, x: -10 },
  visible: (i = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: EASE_OUT, delay: Math.min(i * 0.04, 0.5) },
  }),
};
