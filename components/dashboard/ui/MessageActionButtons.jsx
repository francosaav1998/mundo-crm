"use client";

import { useState, useRef, useEffect } from "react";
import {
  getWhatsAppUrl,
  getGmailComposeUrl,
  getOutlookComposeUrl,
  openLink,
  openMailto,
} from "@/lib/messaging";

export default function MessageActionButtons({
  lead,
  T,
  whatsappText = "",
  emailSubject = "",
  emailBody = "",
  sent = false,
  onSent,
  showToast,
}) {
  const [emailOpen, setEmailOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setEmailOpen(false);
      }
    }
    if (emailOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [emailOpen]);

  const handleWhatsApp = () => {
    if (!lead.phone) {
      showToast?.("El lead no tiene teléfono");
      return;
    }
    openLink(getWhatsAppUrl(lead.phone, whatsappText));
    onSent?.();
  };

  const handleEmail = (client) => {
    if (!lead.email) {
      showToast?.("El lead no tiene email");
      return;
    }
    const subject = emailSubject || "Seguimiento Mundo";
    const body =
      emailBody ||
      `Hola ${lead.name || ""},\n\nTe escribo para dar seguimiento a tu consulta.\n\nSaludos.`;

    if (client === "gmail") {
      openLink(getGmailComposeUrl(lead.email, subject, body));
    } else if (client === "outlook") {
      openLink(getOutlookComposeUrl(lead.email, subject, body));
    } else {
      openMailto(lead.email, subject, body);
    }
    setEmailOpen(false);
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
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.2s",
    whiteSpace: "nowrap",
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {sent && (
        <span
          title="Mensaje abierto"
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
      <button
        onClick={handleWhatsApp}
        title="Abrir WhatsApp"
        style={{
          ...btnBase,
          background: "#25D366",
          color: "#fff",
        }}
      >
        <i className="bi bi-whatsapp"></i>
        <span className="hidden sm:inline">WhatsApp</span>
      </button>

      <div ref={containerRef} style={{ position: "relative" }}>
        <button
          onClick={() => setEmailOpen((v) => !v)}
          title="Enviar email"
          style={{
            ...btnBase,
            background: T.accent,
            color: "#fff",
          }}
        >
          <i className="bi bi-envelope-fill"></i>
          <span className="hidden sm:inline">Email</span>
          <i className={`bi bi-chevron-${emailOpen ? "up" : "down"}`} style={{ fontSize: 10 }}></i>
        </button>

        {emailOpen && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              right: 0,
              zIndex: 50,
              minWidth: 160,
              background: T.bgCard,
              border: `1px solid ${T.border}`,
              borderRadius: 12,
              boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
              overflow: "hidden",
            }}
          >
            {[
              { id: "gmail", icon: "bi-google", label: "Gmail" },
              { id: "outlook", icon: "bi-microsoft", label: "Outlook" },
              { id: "mailto", icon: "bi-envelope", label: "Mi cliente" },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleEmail(opt.id)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 14px",
                  border: "none",
                  background: "transparent",
                  color: T.text,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "inherit",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = `${T.accent}10`)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <i className={`bi ${opt.icon}`} style={{ color: T.accent }}></i>
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
