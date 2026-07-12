"use client";

import { useState } from "react";
import Image from "next/image";
import { normalizeWhatsAppNumber } from "@/lib/seller";
import { uploadFileBrowser } from "@/lib/upload/browser";
import BulkWhatsApp from "./BulkWhatsApp";

const TABS = [
  { id: "perfil", label: "Perfil", icon: "bi-person-circle" },
  { id: "whatsapp", label: "WhatsApp", icon: "bi-whatsapp" },
  { id: "apariencia", label: "Apariencia", icon: "bi-palette-fill" },
  { id: "avanzado", label: "Avanzado", icon: "bi-sliders2-vertical" },
];

export default function SettingsForm({
  settings,
  onUpdateSettings,
  onSaveSettings,
  T,
  isMobile,
  showToast,
  isAdmin = false,
  leads = [],
}) {
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [activeTab, setActiveTab] = useState("perfil");

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

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast("El video no debe pesar más de 5 MB");
      return;
    }
    setUploadingVideo(true);
    try {
      const { url } = await uploadFileBrowser(file, "videos");
      onUpdateSettings({ bgVideoUrl: url });
      showToast("Video de fondo actualizado");
    } catch (err) {
      showToast(err.message || "Error al subir video");
    } finally {
      setUploadingVideo(false);
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
    borderRadius: 10,
    background: `${T.accent}15`,
    border: `1px solid ${T.accent}40`,
    color: T.accent,
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
    transition: "all 0.2s",
  };

  const tabBtn = (id) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: isMobile ? "10px 12px" : "10px 16px",
    borderRadius: 12,
    border: "none",
    background: activeTab === id ? T.accent : "transparent",
    color: activeTab === id ? "#fff" : T.muted,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 700,
    whiteSpace: "nowrap",
    transition: "all 0.2s",
    boxShadow: activeTab === id ? `0 4px 14px ${T.accent}50` : "none",
  });

  return (
    <div
      style={{
        background: T.bgCard,
        border: `1px solid ${T.border}`,
        borderRadius: "24px",
        padding: isMobile ? "20px" : "32px",
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.3)",
        maxWidth: activeTab === "whatsapp" ? "1100px" : "720px",
        margin: "0 auto",
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: "20px", fontWeight: 800, color: T.accent, margin: "0 0 6px 0", display: "flex", alignItems: "center", gap: 10 }}>
          <i className="bi bi-gear-wide-connected"></i>
          Configuración
        </h2>
        <p style={{ fontSize: "13px", color: T.muted, margin: 0 }}>
          Administrá tu perfil, mensajes de WhatsApp y apariencia de la landing.
        </p>
      </div>

      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, marginBottom: 28, scrollbarWidth: "thin" }}>
        {TABS.map((tab) => (
          <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} style={tabBtn(tab.id)}>
            <i className={`bi ${tab.icon}`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {activeTab === "perfil" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <h3 style={sectionTitleStyle}>
                <i className="bi bi-person-circle" style={{ marginRight: 6 }}></i>
                Datos Personales
              </h3>

              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
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

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Nombre completo *</label>
                  <input
                    type="text"
                    value={settings.sellerName}
                    onChange={(e) => onUpdateSettings({ sellerName: e.target.value })}
                    style={inputStyle}
                    required
                  />
                </div>
                <div>
                  <label style={labelStyle}>Email *</label>
                  <input
                    type="email"
                    value={settings.sellerEmail}
                    onChange={(e) => onUpdateSettings({ sellerEmail: e.target.value })}
                    style={inputStyle}
                    required
                  />
                  <span style={{ fontSize: "11px", color: T.muted, marginTop: 6, display: "block" }}>
                    Acá te avisaremos cuando llegue un nuevo lead.
                  </span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>WhatsApp (Formato Chile 569...) *</label>
                  <input
                    type="text"
                    inputMode="tel"
                    value={settings.sellerPhone}
                    onChange={(e) => onUpdateSettings({ sellerPhone: normalizeWhatsAppNumber(e.target.value) })}
                    style={inputStyle}
                    placeholder="Ej: 56912345678"
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
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Bio / Presentación *</label>
                <textarea
                  value={settings.sellerBio}
                  onChange={(e) => onUpdateSettings({ sellerBio: e.target.value })}
                  rows={4}
                  style={textareaStyle}
                  required
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "whatsapp" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <h3 style={sectionTitleStyle}>
                <i className="bi bi-chat-dots-fill" style={{ marginRight: 6 }}></i>
                Mensaje Inicial de WhatsApp
              </h3>
              <div>
                <label style={labelStyle}>Mensaje por defecto *</label>
                <textarea
                  value={settings.sellerMsg}
                  onChange={(e) => onUpdateSettings({ sellerMsg: e.target.value })}
                  rows={3}
                  style={textareaStyle}
                  required
                />
                <span style={{ fontSize: "11px", color: T.muted, marginTop: 6, display: "block" }}>
                  Se abre automáticamente cuando un visitante hace clic en tu botón de WhatsApp.
                </span>
              </div>
            </div>

            <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 24 }}>
              <h3 style={sectionTitleStyle}>
                <i className="bi bi-people-fill" style={{ marginRight: 6 }}></i>
                Envío Masivo a Clientes
              </h3>
              <BulkWhatsApp
                leads={leads}
                T={T}
                isMobile={isMobile}
                showToast={showToast}
                defaultMessage={settings.sellerMsg}
              />
            </div>
          </div>
        )}

        {activeTab === "apariencia" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <h3 style={sectionTitleStyle}>
                <i className="bi bi-palette-fill" style={{ marginRight: 6 }}></i>
                Apariencia de la Landing
              </h3>

              <div style={{ marginBottom: 18 }}>
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

              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Texto del Footer</label>
                <textarea
                  value={settings.footerText}
                  onChange={(e) => onUpdateSettings({ footerText: e.target.value })}
                  rows={3}
                  style={textareaStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>URL del video de fondo</label>
                <input
                  type="text"
                  value={settings.bgVideoUrl}
                  onChange={(e) => onUpdateSettings({ bgVideoUrl: e.target.value })}
                  style={inputStyle}
                  placeholder="https://..."
                />
                <label style={{ ...uploadBtnStyle, marginTop: 12, opacity: uploadingVideo ? 0.6 : 1, cursor: uploadingVideo ? "not-allowed" : "pointer" }}>
                  <i className={`bi ${uploadingVideo ? "bi-arrow-clockwise" : "bi-upload"}`}></i>
                  {uploadingVideo ? "Subiendo..." : "Subir video desde mi PC"}
                  <input type="file" accept="video/mp4,video/webm" disabled={uploadingVideo} onChange={handleVideoUpload} style={{ display: "none" }} />
                </label>
                {settings.bgVideoUrl && (
                  <div style={{ marginTop: 12, borderRadius: 12, overflow: "hidden", border: `1px solid ${T.border}`, background: "#000" }}>
                    <video src={settings.bgVideoUrl} autoPlay muted loop playsInline style={{ width: "100%", height: 120, objectFit: "cover", display: "block" }} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "avanzado" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <h3 style={sectionTitleStyle}>
                <i className="bi bi-facebook" style={{ marginRight: 6 }}></i>
                Meta Pixel
              </h3>
              <div>
                <label style={labelStyle}>ID del Pixel (solo números)</label>
                <input
                  type="text"
                  value={settings.metaPixelId}
                  onChange={(e) => onUpdateSettings({ metaPixelId: e.target.value.replace(/\D/g, "") })}
                  style={inputStyle}
                  placeholder="Ej: 123456789012345"
                />
              </div>
            </div>

            {isAdmin && (
              <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 24 }}>
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
            )}
          </div>
        )}

        {activeTab !== "whatsapp" && (
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
        )}
      </form>
    </div>
  );
}
