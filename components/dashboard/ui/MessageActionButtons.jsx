"use client";

import RippleButton from "@/components/ui/RippleButton";
import Tooltip from "@/components/ui/Tooltip";
import { getWhatsAppUrl, openLink } from "@/lib/messaging";

/**
 * MessageActionButtons — Botones rápidos de contacto para la tabla de leads.
 *
 * - WhatsApp abre directamente el chat sin mensaje precargado.
 * - Email abre el cliente de correo por defecto (mailto:) sin asunto ni cuerpo.
 * - Totalmente responsivo: en mobile se muestran como iconos compactos.
 */
export default function MessageActionButtons({ lead, T, sent = false, onSent, showToast }) {
  const handleWhatsApp = () => {
    if (!lead.phone) {
      showToast?.("El lead no tiene teléfono");
      return;
    }
    openLink(getWhatsAppUrl(lead.phone, ""));
    onSent?.();
  };

  const handleEmail = () => {
    if (!lead.email) {
      showToast?.("El lead no tiene email");
      return;
    }
    window.location.href = `mailto:${lead.email}`;
    onSent?.();
  };

  const btnBase = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: "6px 10px",
    borderRadius: "8px",
    border: "none",
    fontSize: "12px",
    fontWeight: 700,
    fontFamily: "inherit",
    whiteSpace: "nowrap",
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {sent && (
        <span
          title="Contacto abierto"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontSize: "11px",
            fontWeight: 800,
            color: "#25D366",
          }}
        >
          <i className="bi bi-check-circle-fill"></i>
        </span>
      )}
      <Tooltip content="Abrir WhatsApp" position="top">
        <RippleButton
          onClick={handleWhatsApp}
          style={{
            ...btnBase,
            background: "#25D366",
            color: "#fff",
          }}
        >
          <i className="bi bi-whatsapp"></i>
          <span className="hidden sm:inline">WhatsApp</span>
        </RippleButton>
      </Tooltip>

      <Tooltip content="Enviar email" position="top">
        <RippleButton
          onClick={handleEmail}
          style={{
            ...btnBase,
            background: T.accent,
            color: "#fff",
          }}
        >
          <i className="bi bi-envelope-fill"></i>
          <span className="hidden sm:inline">Email</span>
        </RippleButton>
      </Tooltip>
    </div>
  );
}
