"use client";

import Image from "next/image";
import { normalizeWhatsAppNumber } from "@/lib/seller";

export default function SettingsForm({
  settings,
  onUpdateSettings,
  onSaveSettings,
  T,
  isMobile,
  showToast,
  isAdmin = false,
}) {
  const handleSave = async (e) => {
    e.preventDefault();
    await onSaveSettings(settings);
  };

  const labelStyle = {
    display: "block",
    fontSize: "11px",
    fontWeight: 700,
    color: T.muted,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "8px",
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    background: T.inputBg,
    border: `1px solid ${T.border}`,
    borderRadius: "12px",
    color: T.text,
    fontSize: "14px",
    outline: "none",
  };

  const textareaStyle = {
    ...inputStyle,
    resize: "none",
    lineHeight: "1.5",
  };

  const sectionTitleStyle = {
    fontSize: "15px",
    fontWeight: 800,
    color: T.accent,
    marginBottom: 12,
  };

  return (
    <div
      style={{
        background: T.bgCard,
        border: `1px solid ${T.border}`,
        borderRadius: "24px",
        padding: isMobile ? "20px" : "40px",
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.3)",
        maxWidth: "650px",
        margin: "0 auto",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 6 }}>
        <h2 style={{ fontSize: "20px", fontWeight: 800, color: T.accent, margin: 0 }}>
          <i className="bi bi-gear-fill" style={{ marginRight: 8 }}></i>
          Configuración del Sistema
        </h2>
      </div>
      <p style={{ fontSize: "13px", color: T.muted, marginBottom: 30 }}>
        {isAdmin
          ? "Ajustes globales del sistema. La foto, nombre, bio, video, tema y footer de la landing se editan desde el Editor de Landing."
          : "Edita el mensaje inicial que se abre automáticamente en WhatsApp cuando un visitante hace clic en tu landing. La foto, nombre, bio y demás datos de perfil se editan en el Editor de Landing."}
      </p>

      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <label style={labelStyle}>Mensaje Inicial por Defecto (WhatsApp)</label>
          <textarea
            value={settings.sellerMsg}
            onChange={(e) => onUpdateSettings({ sellerMsg: e.target.value })}
            rows={3}
            style={textareaStyle}
            required
          />
        </div>

        {isAdmin && (
          <>
            {/* WhatsApp QR */}
            <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 20, marginTop: 4 }}>
              <h3 style={sectionTitleStyle}>
                <i className="bi bi-qr-code-scan" style={{ marginRight: 6 }}></i>
                WhatsApp Público de la Web
              </h3>
              <label style={labelStyle}>Número del botón WhatsApp (Formato Chile 569...)</label>
              <input
                type="text"
                inputMode="tel"
                value={settings.whatsappNumber}
                onChange={(e) => onUpdateSettings({ whatsappNumber: e.target.value.replace(/\D/g, "") })}
                style={inputStyle}
                placeholder="Ej: 56912345678"
                required
              />
              <span style={{ fontSize: "11px", color: T.muted, marginTop: 6, display: "block" }}>
                Este número se muestra en el botón de WhatsApp de la landing y en el QR público.
              </span>
              <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
                <Image
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent("https://wa.me/" + normalizeWhatsAppNumber(settings.whatsappNumber))}`}
                  alt="QR WhatsApp"
                  width={180}
                  height={180}
                  style={{ borderRadius: "14px" }}
                />
              </div>
              <span style={{ fontSize: "11px", color: T.muted, marginTop: 6, display: "block", textAlign: "center" }}>
                QR del botón WhatsApp para {normalizeWhatsAppNumber(settings.whatsappNumber) || "—"}.
              </span>
            </div>

            {/* SMTP */}
            <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 20, marginTop: 4 }}>
              <h3 style={sectionTitleStyle}>
                <i className="bi bi-envelope-gear-fill" style={{ marginRight: 6 }}></i>
                Correo Masivo (SMTP)
              </h3>
              <div style={{ padding: 14, borderRadius: "12px", background: T.inputBg, border: `1px solid ${T.border}` }}>
                <p style={{ fontSize: "12px", color: T.muted, lineHeight: 1.5, marginBottom: 10 }}>
                  El servidor SMTP se configura de forma segura mediante variables de entorno
                  (<code>SMTP_HOST</code>, <code>SMTP_PORT</code>, <code>SMTP_USER</code>,
                  <code>SMTP_PASS</code>, <code>SMTP_FROM</code>). No se almacenan credenciales
                  en el navegador ni se envían al frontend.
                </p>
                <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "13px", fontWeight: 600, color: T.text, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={settings.emailUseSmtp}
                    onChange={(e) => onUpdateSettings({ emailUseSmtp: e.target.checked })}
                    style={{ width: 18, height: 18, accentColor: T.accent }}
                  />
                  Usar SMTP server-side en lugar de Mailto
                </label>
              </div>
            </div>
          </>
        )}

        <button
          type="submit"
          style={{
            background: `linear-gradient(135deg, ${T.accent} 0%, #0077A8 100%)`,
            color: "#FFFFFF",
            fontWeight: 800,
            padding: "14px",
            borderRadius: "12px",
            border: "none",
            cursor: "pointer",
            fontSize: "14px",
            boxShadow: T.glowGold,
            transition: "all 0.2s",
            marginTop: "10px",
          }}
        >
          <i className="bi bi-check-lg" style={{ marginRight: 6 }}></i>
          {isAdmin ? "Guardar Configuración" : "Guardar Mensaje por Defecto"}
        </button>
      </form>
    </div>
  );
}
