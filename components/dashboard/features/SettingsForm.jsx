"use client";

import { useState } from "react";
import Image from "next/image";
import { normalizeWhatsAppNumber } from "@/lib/seller";
import { uploadFileBrowser } from "@/lib/upload/browser";

export default function SettingsForm({
  settings,
  onUpdateSettings,
  onSaveSettings,
  T,
  isMobile,
  showToast,
  isAdmin = false,
}) {
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    await onSaveSettings(settings);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const { url } = await uploadFileBrowser(file, "seller");
      onUpdateSettings({ sellerPhoto: url });
      showToast("Foto actualizada");
    } catch (err) {
      showToast(err.message || "Error al subir foto");
    } finally {
      setUploadingPhoto(false);
    }
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

  const uploadBtnStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "10px 16px",
    borderRadius: "10px",
    background: `${T.accent}15`,
    border: `1px solid ${T.accent}40`,
    color: T.accent,
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
    transition: "all 0.2s",
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
        Edita tu perfil, mensaje de WhatsApp y la apariencia de tu landing desde un solo lugar.
      </p>

      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Perfil */}
        <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 20 }}>
          <h3 style={sectionTitleStyle}>
            <i className="bi bi-person-circle" style={{ marginRight: 6 }}></i>
            Perfil de Ejecutivo/a
          </h3>

          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
            <div
              style={{
                width: 88,
                height: 88,
                borderRadius: 18,
                overflow: "hidden",
                background: T.inputBg,
                border: `1px solid ${T.border}`,
                flexShrink: 0,
                position: "relative",
              }}
            >
              {settings.sellerPhoto ? (
                <Image src={settings.sellerPhoto} alt="Vendedor" fill style={{ objectFit: "cover" }} />
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: T.muted, fontSize: 32 }}>
                  <i className="bi bi-person-fill" />
                </div>
              )}
            </div>
            <label style={{ ...uploadBtnStyle, opacity: uploadingPhoto ? 0.6 : 1, cursor: uploadingPhoto ? "not-allowed" : "pointer" }}>
              <i className={`bi ${uploadingPhoto ? "bi-arrow-clockwise" : "bi-upload"}`}></i>
              {uploadingPhoto ? "Subiendo..." : "Subir Foto"}
              <input type="file" accept="image/*" disabled={uploadingPhoto} onChange={handlePhotoUpload} style={{ display: "none" }} />
            </label>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={labelStyle}>Nombre del Ejecutivo/a</label>
              <input
                type="text"
                value={settings.sellerName}
                onChange={(e) => onUpdateSettings({ sellerName: e.target.value })}
                style={inputStyle}
                placeholder="Ej: María González"
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Género para adaptar la landing</label>
              <div style={{ display: "flex", gap: 10 }}>
                {[
                  { value: "", label: "Auto-detectar" },
                  { value: "female", label: "Mujer" },
                  { value: "male", label: "Hombre" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onUpdateSettings({ sellerGender: option.value })}
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: 12,
                      border: settings.sellerGender === option.value ? `2px solid ${T.accent}` : `1px solid ${T.border}`,
                      background: settings.sellerGender === option.value ? `${T.accent}15` : "transparent",
                      color: settings.sellerGender === option.value ? T.accent : T.muted,
                      cursor: "pointer",
                      fontSize: 14,
                      fontWeight: 700,
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={labelStyle}>Teléfono WhatsApp (Formato Chile 569...)</label>
              <input
                type="text"
                inputMode="tel"
                value={settings.sellerPhone}
                onChange={(e) => onUpdateSettings({ sellerPhone: e.target.value.replace(/\D/g, "") })}
                style={inputStyle}
                placeholder="Ej: 56912345678"
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Texto de Presentación / Bio</label>
              <textarea
                value={settings.sellerBio}
                onChange={(e) => onUpdateSettings({ sellerBio: e.target.value })}
                rows={4}
                style={textareaStyle}
              />
            </div>
          </div>
        </div>

        {/* Mensaje WhatsApp */}
        <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 20 }}>
          <h3 style={sectionTitleStyle}>
            <i className="bi bi-chat-left-text-fill" style={{ marginRight: 6 }}></i>
            Mensaje Inicial por Defecto (WhatsApp)
          </h3>
          <textarea
            value={settings.sellerMsg}
            onChange={(e) => onUpdateSettings({ sellerMsg: e.target.value })}
            rows={3}
            style={textareaStyle}
            required
          />
        </div>

        {/* Apariencia y Footer */}
        <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 20 }}>
          <h3 style={sectionTitleStyle}>
            <i className="bi bi-palette-fill" style={{ marginRight: 6 }}></i>
            Apariencia de la Landing
          </h3>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Modo de vista</label>
            <div style={{ display: "flex", gap: 10 }}>
              {["light", "dark"].map((theme) => (
                <button
                  key={theme}
                  type="button"
                  onClick={() => onUpdateSettings({ landingTheme: theme })}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: 12,
                    border: settings.landingTheme === theme ? `2px solid ${T.accent}` : `1px solid ${T.border}`,
                    background: settings.landingTheme === theme ? `${T.accent}15` : "transparent",
                    color: settings.landingTheme === theme ? T.accent : T.muted,
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <i className={`bi bi-${theme === "light" ? "sun-fill" : "moon-stars-fill"}`}></i>
                  {theme === "light" ? "Día" : "Noche"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Texto del Footer</label>
            <textarea
              value={settings.footerText}
              onChange={(e) => onUpdateSettings({ footerText: e.target.value })}
              rows={3}
              style={textareaStyle}
            />
          </div>
        </div>

        {/* Meta Pixel */}
        <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 20 }}>
          <h3 style={sectionTitleStyle}>
            <i className="bi bi-megaphone-fill" style={{ marginRight: 6 }}></i>
            Meta Pixel
          </h3>
          <input
            type="text"
            value={settings.metaPixelId}
            onChange={(e) => onUpdateSettings({ metaPixelId: e.target.value.replace(/\D/g, "") })}
            style={inputStyle}
            placeholder="Ej: 123456789012345"
          />
        </div>

        {isAdmin && (
          <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 20 }}>
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
          Guardar Configuración
        </button>
      </form>
    </div>
  );
}
