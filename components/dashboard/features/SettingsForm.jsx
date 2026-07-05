"use client";

import Image from "next/image";
import { useState } from "react";
import { normalizeWhatsAppNumber } from "@/lib/seller";
import { uploadFileBrowser } from "@/lib/upload/browser";

export default function SettingsForm({
  settings,
  onUpdateSettings,
  onSaveSettings,
  T,
  isMobile,
  showToast,
}) {
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const { url } = await uploadFileBrowser(file, "seller");

      const updated = { ...settings, sellerPhoto: url };
      onUpdateSettings({ sellerPhoto: url });
      await onSaveSettings(updated);
      showToast("Foto subida y guardada correctamente");
    } catch (err) {
      showToast(err.message || "Error al subir foto");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const MAX_VIDEO_SIZE = 5 * 1024 * 1024; // 5 MB

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_VIDEO_SIZE) {
      showToast("El video no debe pesar más de 5 MB (ideal < 2 MB).");
      return;
    }

    setUploadingVideo(true);
    try {
      const { url } = await uploadFileBrowser(file, "videos");

      const updated = { ...settings, bgVideoUrl: url };
      onUpdateSettings({ bgVideoUrl: url });
      await onSaveSettings(updated);
      showToast("Video de fondo subido y guardado correctamente");
    } catch (err) {
      showToast(err.message || "Error al subir video");
    } finally {
      setUploadingVideo(false);
    }
  };

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

  const uploadLabelStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 16px",
    borderRadius: "10px",
    background: `${T.accent}20`,
    border: `1px solid ${T.accent}40`,
    color: T.accent,
    fontWeight: 700,
    fontSize: "13px",
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
          <i className="bi bi-person-badge-fill" style={{ marginRight: 8 }}></i>
          Presentación del Vendedor
        </h2>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            borderRadius: "10px",
            background: `linear-gradient(135deg, ${T.accent} 0%, ${T.accent2} 100%)`,
            color: "#FFFFFF",
            fontWeight: 700,
            fontSize: "13px",
            textDecoration: "none",
            boxShadow: T.glowCyan,
            transition: "all 0.2s",
          }}
        >
          <i className="bi bi-eye-fill"></i>
          Ver en la Landing
        </a>
      </div>
      <p style={{ fontSize: "13px", color: T.muted, marginBottom: 30 }}>
        Personaliza la foto, nombre, contacto y texto que se muestra automáticamente en la landing page de ventas.
      </p>

      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Photo Upload */}
        <div>
          <label style={labelStyle}>Foto del Vendedor</label>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "16px",
                overflow: "hidden",
                background: "rgba(255,255,255,0.05)",
                border: `1px solid ${T.border}`,
                flexShrink: 0,
                position: "relative",
              }}
            >
              {settings.sellerPhoto ? (
                <Image src={settings.sellerPhoto} alt="Vendedor" fill style={{ objectFit: "cover" }} />
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: T.muted, fontSize: 24 }}>
                  <i className="bi bi-person-fill" />
                </div>
              )}
            </div>
            <label
              style={{
                ...uploadLabelStyle,
                background: uploadingPhoto ? "rgba(255,255,255,0.06)" : uploadLabelStyle.background,
                color: uploadingPhoto ? T.muted : T.accent,
                cursor: uploadingPhoto ? "not-allowed" : "pointer",
              }}
            >
              <i className={`bi ${uploadingPhoto ? "bi-arrow-clockwise" : "bi-upload"}`} style={{ marginRight: 6 }}></i>
              {uploadingPhoto ? "Subiendo..." : "Subir Foto"}
              <input type="file" accept="image/*" disabled={uploadingPhoto} onChange={handlePhotoUpload} style={{ display: "none" }} />
            </label>
          </div>
        </div>

        <div>
          <label style={labelStyle}>Nombre del Ejecutivo/a</label>
          <input
            type="text"
            value={settings.sellerName}
            onChange={(e) => onUpdateSettings({ sellerName: e.target.value })}
            style={inputStyle}
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
                  borderRadius: "12px",
                  border: settings.sellerGender === option.value ? `2px solid ${T.accent}` : `1px solid ${T.border}`,
                  background: settings.sellerGender === option.value ? `${T.accent}15` : "transparent",
                  color: settings.sellerGender === option.value ? T.accent : T.muted,
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "all 0.2s",
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
          <span style={{ fontSize: "11px", color: T.muted, marginTop: 6, display: "block" }}>
            La landing usará &quot;ejecutivo&quot;, &quot;ejecutiva&quot;, &quot;vendedor&quot; o &quot;vendedora&quot; según esta selección.
          </span>
        </div>

        <div>
          <label style={labelStyle}>Texto de Presentación</label>
          <textarea
            value={settings.sellerBio}
            onChange={(e) => onUpdateSettings({ sellerBio: e.target.value })}
            rows={4}
            style={textareaStyle}
            required
          />
          <span style={{ fontSize: "11px", color: T.muted, marginTop: 4, display: "block" }}>
            Este texto se muestra en la sección del vendedor en la landing page.
          </span>
        </div>

        <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 20 }}>
          <label style={labelStyle}>Teléfono WhatsApp (Formato Chile 569...)</label>
          <input
            type="text"
            value={settings.sellerPhone}
            onChange={(e) => onUpdateSettings({ sellerPhone: e.target.value })}
            style={inputStyle}
            required
          />
        </div>

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

        {/* Landing Theme */}
        <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 20, marginTop: 4 }}>
          <h3 style={sectionTitleStyle}>
            <i className="bi bi-palette-fill" style={{ marginRight: 6 }}></i>
            Apariencia de la Landing
          </h3>
          <label style={labelStyle}>Modo de vista (Día / Noche)</label>
          <div style={{ display: "flex", gap: 10 }}>
            {["light", "dark"].map((theme) => (
              <button
                key={theme}
                type="button"
                onClick={() => onUpdateSettings({ landingTheme: theme })}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "12px",
                  border: settings.landingTheme === theme ? `2px solid ${T.accent}` : `1px solid ${T.border}`,
                  background: settings.landingTheme === theme ? `${T.accent}15` : "transparent",
                  color: settings.landingTheme === theme ? T.accent : T.muted,
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "all 0.2s",
                }}
              >
                <i className={`bi bi-${theme === "light" ? "sun-fill" : "moon-stars-fill"}`}></i>
                {theme === "light" ? "Día" : "Noche"}
              </button>
            ))}
          </div>
          <span style={{ fontSize: "11px", color: T.muted, marginTop: 6, display: "block" }}>
            Controla si la landing de ventas se ve en modo claro u oscuro.
          </span>
        </div>

        {/* WhatsApp QR */}
        <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 20, marginTop: 4 }}>
          <h3 style={sectionTitleStyle}>
            <i className="bi bi-qr-code-scan" style={{ marginRight: 6 }}></i>
            WhatsApp de Recepción de Leads
          </h3>
          <label style={labelStyle}>Número de WhatsApp (Formato Chile 569...)</label>
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
            Los leads que lleguen desde la landing se enviarán a este WhatsApp automáticamente.
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
            Código QR generado para {normalizeWhatsAppNumber(settings.whatsappNumber) || "—"}.
          </span>
        </div>

        {/* Footer Text */}
        <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 20, marginTop: 4 }}>
          <h3 style={sectionTitleStyle}>
            <i className="bi bi-text-left" style={{ marginRight: 6 }}></i>
            Texto del Footer (Abajo de la Landing)
          </h3>
          <label style={labelStyle}>Mensaje de Presentación / Despedida</label>
          <textarea
            value={settings.footerText}
            onChange={(e) => onUpdateSettings({ footerText: e.target.value })}
            rows={3}
            style={{ ...textareaStyle, resize: "vertical", fontFamily: "inherit" }}
            required
          />
          <span style={{ fontSize: "11px", color: T.muted, marginTop: 6, display: "block" }}>
            Este texto aparece abajo de la landing en la sección &quot;Sobre el asesor&quot;.
          </span>
        </div>

        {/* Background Video */}
        <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 20, marginTop: 4 }}>
          <h3 style={sectionTitleStyle}>
            <i className="bi bi-play-btn-fill" style={{ marginRight: 6 }}></i>
            Video de Fondo (Sección Principal)
          </h3>
          <label style={labelStyle}>URL o ruta del archivo de video</label>
          <input
            type="text"
            value={settings.bgVideoUrl}
            onChange={(e) => onUpdateSettings({ bgVideoUrl: e.target.value })}
            style={{ ...inputStyle, fontFamily: "monospace" }}
            placeholder="https://[tu-proyecto].supabase.co/storage/v1/object/public/assets/videos/..."
          />
          <span style={{ fontSize: "11px", color: T.muted, marginTop: 6, display: "block" }}>
            Se muestra en loop, sin sonido, solo en la primera sección de la landing.
          </span>

          <label
            style={{
              ...uploadLabelStyle,
              marginTop: 10,
              background: uploadingVideo ? "rgba(255,255,255,0.06)" : uploadLabelStyle.background,
              color: uploadingVideo ? T.muted : T.accent,
              cursor: uploadingVideo ? "not-allowed" : "pointer",
            }}
          >
            <i className={`bi ${uploadingVideo ? "bi-arrow-clockwise" : "bi-upload"}`} />
            {uploadingVideo ? "Subiendo video..." : "Subir video desde mi PC"}
            <input type="file" accept="video/mp4,video/webm" disabled={uploadingVideo} onChange={handleVideoUpload} style={{ display: "none" }} />
          </label>

          {settings.bgVideoUrl && (
            <div style={{ marginTop: 12, borderRadius: "12px", overflow: "hidden", border: `1px solid ${T.border}`, background: "#000" }}>
              <video
                src={settings.bgVideoUrl}
                autoPlay
                muted
                loop
                playsInline
                style={{ width: "100%", height: "120px", objectFit: "cover", display: "block" }}
              />
            </div>
          )}

          <div
            style={{
              marginTop: 12,
              padding: "14px 16px",
              borderRadius: "12px",
              background: `${T.accent}08`,
              border: `1px solid ${T.accent}25`,
              fontSize: "12px",
              color: T.muted,
              lineHeight: 1.6,
            }}
          >
            <div style={{ fontWeight: 800, color: T.text, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
              <i className="bi bi-info-circle-fill" style={{ color: T.accent }}></i>
              Especificaciones recomendadas
            </div>
            <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 3 }}>
              <li><strong style={{ color: T.text }}>Formato:</strong> MP4 (H.264) o WebM</li>
              <li><strong style={{ color: T.text }}>Resolución:</strong> 1280x720 (720p) o 1920x1080 (1080p)</li>
              <li><strong style={{ color: T.text }}>Relación:</strong> 16:9 horizontal (se ajusta con object-fit: cover)</li>
              <li><strong style={{ color: T.text }}>Duración:</strong> 5 a 15 segundos (loop perfecto)</li>
              <li><strong style={{ color: T.text }}>Tamaño:</strong> máximo 5 MB (ideal &lt; 2 MB)</li>
              <li><strong style={{ color: T.text }}>Sin audio:</strong> se reproduce <code style={{ color: T.accent }}>muted</code></li>
              <li><strong style={{ color: T.text }}>Tema:</strong> colores oscuros/azulados para no opacar el texto</li>
            </ul>
          </div>

          <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => {
                onUpdateSettings({ bgVideoUrl: "/bg-loop.mp4" });
                showToast("Video por defecto aplicado");
              }}
              style={{ padding: "6px 12px", borderRadius: "8px", border: `1px solid ${T.border}`, background: "transparent", color: T.muted, fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
            >
              <i className="bi bi-arrow-counterclockwise" style={{ marginRight: 4 }}></i>
              Usar video por defecto
            </button>
            <button
              type="button"
              onClick={() => {
                onUpdateSettings({ bgVideoUrl: "" });
                showToast("Video quitado - se muestra solo color de fondo");
              }}
              style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.05)", color: "#EF4444", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
            >
              <i className="bi bi-trash3-fill" style={{ marginRight: 4 }}></i>
              Quitar video (solo color)
            </button>
          </div>
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

        {/* Meta Pixel */}
        <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 20, marginTop: 4 }}>
          <h3 style={sectionTitleStyle}>
            <i className="bi bi-meta" style={{ marginRight: 6 }}></i>
            Meta Pixel (Facebook / Instagram Ads)
          </h3>
          <label style={labelStyle}>ID del Pixel (solo números)</label>
          <input
            type="text"
            value={settings.metaPixelId}
            onChange={(e) => onUpdateSettings({ metaPixelId: e.target.value.replace(/[^\d]/g, "") })}
            style={{ ...inputStyle, fontFamily: "monospace", letterSpacing: "0.05em" }}
            placeholder="Ej: 123456789012345"
          />
          <span style={{ fontSize: "11px", color: T.muted, marginTop: 6, display: "block" }}>
            Ingresa el ID numérico de tu Pixel desde Meta Business Manager. Se inyectará automáticamente en la landing de ventas para rastrear PageView y conversión de leads.
          </span>
          {settings.metaPixelId && (
            <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: "10px", background: `${T.accent}10`, border: `1px solid ${T.accent}30`, display: "flex", alignItems: "center", gap: 8 }}>
              <i className="bi bi-check-circle-fill" style={{ color: T.accent4 || T.accent, fontSize: 16 }}></i>
              <span style={{ fontSize: "12px", fontWeight: 700, color: T.text }}>
                Pixel activo: <code style={{ color: T.accent, fontFamily: "monospace" }}>{settings.metaPixelId}</code>
              </span>
            </div>
          )}
        </div>

        <button
          type="submit"
          style={{
            background: `linear-gradient(135deg, ${T.accent} 0%, #0077A8 100%)`,
            color: T.bg,
            fontWeight: 800,
            padding: "14px",
            borderRadius: "12px",
            border: "none",
            cursor: "pointer",
            fontSize: "14px",
            boxShadow: T.glowCyan,
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
