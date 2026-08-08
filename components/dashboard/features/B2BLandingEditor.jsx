"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { DEFAULT_B2B_LANDING_CSS, DEFAULT_B2B_LANDING_BODY } from "@/lib/b2b-landing";
import RippleButton from "@/components/ui/RippleButton";
import SectionHeader from "@/components/dashboard/ui/SectionHeader";
import { normalizeB2BBranding } from "@/lib/b2b-branding";
import { B2B_MOBILE_CSS } from "@/lib/b2b-mobile";

export default function B2BLandingEditor({ T, isMobile, showToast }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [css, setCss] = useState(DEFAULT_B2B_LANDING_CSS);
  const [body, setBody] = useState(() => normalizeB2BBranding(DEFAULT_B2B_LANDING_BODY));
  const [previewMode, setPreviewMode] = useState("desktop");
  const [mobileTab, setMobileTab] = useState("edit");
  const [activeTab, setActiveTab] = useState("visual");
  const iframeRef = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/b2b-landing");
        if (res.ok) {
          const data = await res.json();
          if (data.css) setCss(data.css);
          if (data.body) setBody(normalizeB2BBranding(data.body));
        }
      } catch (err) {
        showToast(err.message || "Error al cargar landing");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [showToast]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/b2b-landing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ css, body }),
      });
      if (!res.ok) throw new Error();
      showToast("Landing B2B guardada correctamente");
      if (isMobile) setMobileTab("preview");
    } catch (err) {
      showToast(err.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  }, [css, body, showToast, isMobile]);

  const handleReset = useCallback(() => {
    if (confirm("¿Restaurar el contenido por defecto? Se perderán los cambios no guardados.")) {
      setCss(DEFAULT_B2B_LANDING_CSS);
      setBody(normalizeB2BBranding(DEFAULT_B2B_LANDING_BODY));
    }
  }, []);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.source !== iframeRef.current?.contentWindow) return;
      const data = event.data;
      if (!data || typeof data !== "object") return;
      if (data.type === "B2B_PREVIEW_HTML_UPDATE" && typeof data.html === "string") {
        setBody(data.html);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const previewSrcDoc = getB2BPreviewDocument({
    body,
    css: `${css}${B2B_MOBILE_CSS}`,
    editable: activeTab === "visual",
  });

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
        <span style={{ color: T.muted }}>Cargando editor...</span>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 14,
        height: isMobile ? "auto" : "calc(100vh - 120px)",
        minHeight: isMobile ? "auto" : 700,
      }}
    >
      <SectionHeader
        eyebrow="Editor de Landing"
        title="Landing B2B principal"
        description="Edita la página de inicio manualmente y también desde la vista previa."
        T={T}
        isMobile={isMobile}
      />

      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: isMobile ? "12px 14px" : "14px 18px",
          background: T.bgCard,
          border: `1px solid ${T.border}`,
          borderRadius: 16,
          flexWrap: isMobile ? "wrap" : "nowrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: `${T.accent}15`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: T.accent,
              fontSize: 16,
              flexShrink: 0,
            }}
          >
            <i className="bi bi-palette-fill"></i>
          </div>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ fontSize: isMobile ? 15 : 16, fontWeight: 800, color: T.text, margin: 0 }}>
              Editor B2B
            </h2>
            <p style={{ fontSize: 11, color: T.muted, margin: "2px 0 0 0" }}>
              Edición manual + vista previa en vivo
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              background: T.inputBg,
              border: `1px solid ${T.border}`,
              borderRadius: 10,
              padding: 3,
            }}
          >
            <ViewportButton
              active={previewMode === "desktop"}
              onClick={() => setPreviewMode("desktop")}
              icon="bi-laptop"
              label="Escritorio"
              T={T}
              hideLabel={isMobile}
            />
            <ViewportButton
              active={previewMode === "mobile"}
              onClick={() => setPreviewMode("mobile")}
              icon="bi-phone"
              label="Móvil"
              T={T}
              hideLabel={isMobile}
            />
          </div>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 14px",
              borderRadius: 10,
              background: `${T.accent}10`,
              border: `1px solid ${T.accent}30`,
              color: T.accent,
              fontSize: 12,
              fontWeight: 700,
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            <i className="bi bi-eye-fill"></i>
            {isMobile ? "Ver" : "Ver publicada"}
          </a>

          <RippleButton
            onClick={handleReset}
            style={{
              padding: "9px 14px",
              borderRadius: 10,
              border: `1px solid ${T.border}`,
              background: "transparent",
              color: T.muted,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <i className="bi bi-arrow-counterclockwise"></i>
            {isMobile ? "Reset" : "Restaurar"}
          </RippleButton>

          <RippleButton
            onClick={handleSave}
            disabled={saving}
            loading={saving}
            loadingText="Guardando..."
            style={{
              padding: "10px 18px",
              borderRadius: 10,
              border: "none",
              background: T.accent,
              color: "#fff",
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <i className="bi bi-check-lg"></i>
            {isMobile ? "Guardar" : "Guardar Cambios"}
          </RippleButton>
        </div>
      </div>

      {/* Mobile tabs */}
      {isMobile && (
        <div
          style={{
            display: "flex",
            gap: 8,
            background: T.inputBg,
            border: `1px solid ${T.border}`,
            borderRadius: 12,
            padding: 4,
          }}
        >
          <button
            onClick={() => setMobileTab("edit")}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: 10,
              border: "none",
              background: mobileTab === "edit" ? T.accent : "transparent",
              color: mobileTab === "edit" ? "#fff" : T.muted,
              fontWeight: 800,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            <i className="bi bi-pencil-square" style={{ marginRight: 6 }}></i> Editar
          </button>
          <button
            onClick={() => setMobileTab("preview")}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: 10,
              border: "none",
              background: mobileTab === "preview" ? T.accent : "transparent",
              color: mobileTab === "preview" ? "#fff" : T.muted,
              fontWeight: 800,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            <i className="bi bi-eye" style={{ marginRight: 6 }}></i> Vista previa
          </button>
        </div>
      )}

      {/* Body */}
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: 16,
          flex: 1,
          minHeight: 0,
        }}
      >
        {/* Sidebar */}
        {(!isMobile || mobileTab === "edit") && (
          <div
            style={{
              width: isMobile ? "100%" : 420,
              minWidth: isMobile ? "auto" : 420,
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              background: T.bgCard,
              border: `1px solid ${T.border}`,
              borderRadius: 20,
              overflow: "hidden",
              boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
              height: isMobile ? "auto" : "100%",
            }}
          >
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: isMobile ? "16px" : "18px",
              }}
            >
              <div
                style={{
                  background: T.inputBg,
                  border: `1px solid ${T.border}`,
                  borderRadius: 18,
                  padding: isMobile ? "16px" : "18px",
                  height: "100%",
                }}
              >
                <div
                  style={{
                    padding: 14,
                    borderRadius: 12,
                    background: `${T.accent}10`,
                    border: `1px solid ${T.accent}25`,
                    fontSize: 13,
                    color: T.muted,
                    lineHeight: 1.5,
                    marginBottom: 16,
                  }}
                >
                  <i className="bi bi-info-circle-fill" style={{ color: T.accent, marginRight: 8 }}></i>
                  Podés editar los textos desde la vista previa o usar HTML y CSS manualmente. La barra deslizante superior tambien se puede editar desde la vista previa.
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                    <button
                      onClick={() => setActiveTab("visual")}
                      style={{
                        padding: "10px 16px",
                        borderRadius: 12,
                        border: "none",
                        background: activeTab === "visual" ? T.accent : "transparent",
                        color: activeTab === "visual" ? "#fff" : T.muted,
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      <i className="bi bi-cursor-text" style={{ marginRight: 6 }}></i>
                      Visual
                    </button>
                    <button
                      onClick={() => setActiveTab("body")}
                      style={{
                        padding: "10px 16px",
                        borderRadius: 12,
                        border: "none",
                        background: activeTab === "body" ? T.accent : "transparent",
                        color: activeTab === "body" ? "#fff" : T.muted,
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      <i className="bi bi-code-slash" style={{ marginRight: 6 }}></i>
                      HTML
                    </button>
                    <button
                      onClick={() => setActiveTab("css")}
                      style={{
                        padding: "10px 16px",
                        borderRadius: 12,
                        border: "none",
                        background: activeTab === "css" ? T.accent : "transparent",
                        color: activeTab === "css" ? "#fff" : T.muted,
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      <i className="bi bi-palette-fill" style={{ marginRight: 6 }}></i>
                      CSS
                    </button>
                </div>

                {activeTab === "visual" && (
                  <div>
                    <div
                      style={{
                        padding: 14,
                        borderRadius: 12,
                        background: `${T.accent}10`,
                        border: `1px solid ${T.accent}25`,
                        fontSize: 13,
                        color: T.muted,
                        lineHeight: 1.5,
                      }}
                    >
                      <i className="bi bi-mouse2-fill" style={{ color: T.accent, marginRight: 8 }}></i>
                      Haz clic sobre cualquier texto en la vista previa, incluida la barra superior deslizante, y edítalo directamente.
                      {isMobile ? " En móvil cambia a la pestaña Vista previa para editar visualmente." : ""}
                    </div>
                  </div>
                )}

                {activeTab === "css" && (
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 10 }}>
                      CSS de la landing
                    </label>
                    <textarea
                      value={css}
                      onChange={(e) => setCss(e.target.value)}
                      style={textareaStyle(T)}
                      spellCheck={false}
                    />
                  </div>
                )}

                {activeTab === "body" && (
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 10 }}>
                      HTML de la landing
                    </label>
                    <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      style={textareaStyle(T)}
                      spellCheck={false}
                    />
                  </div>
                )}

                <div
                  style={{
                    marginTop: 16,
                    padding: 14,
                    borderRadius: 12,
                    background: `${T.accent}10`,
                    border: `1px solid ${T.accent}25`,
                    fontSize: 13,
                    color: T.muted,
                    lineHeight: 1.5,
                  }}
                >
                  <i className="bi bi-info-circle-fill" style={{ color: T.accent, marginRight: 8 }}></i>
                  Los cambios se guardan en la base de datos y se reflejan en la página de inicio <strong>/</strong>. El botón <strong>Restaurar</strong> vuelve al contenido por defecto.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preview iframe */}
        {(!isMobile || mobileTab === "preview") && (
          <div
            style={{
              flex: 1,
              minWidth: 0,
              height: isMobile ? 600 : "100%",
              display: "flex",
              flexDirection: "column",
              background: "rgba(0,0,0,0.22)",
              borderRadius: 20,
              border: `1px solid ${T.border}`,
              overflow: "hidden",
              boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                padding: "10px 14px",
                background: T.bgCard,
                borderBottom: `1px solid ${T.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <i className="bi bi-aspect-ratio" style={{ color: T.muted, fontSize: 14 }}></i>
                <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>
                  {previewMode === "mobile" ? "Vista móvil" : "Vista escritorio"}
                </span>
              </div>
              <span style={{ fontSize: 11, color: T.muted }}>
                Se actualiza en vivo
              </span>
            </div>
            <div
              style={{
                flex: 1,
                overflow: "auto",
                display: "flex",
                justifyContent: previewMode === "mobile" ? "center" : "flex-start",
                background: "rgba(0,0,0,0.05)",
              }}
            >
              <iframe
                ref={iframeRef}
                srcDoc={previewSrcDoc}
                title="Vista previa B2B"
                style={{
                  width: previewMode === "mobile" ? 390 : "100%",
                  minWidth: previewMode === "mobile" ? 390 : "100%",
                  height: "100%",
                  border: "none",
                  background: "#fff",
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getB2BPreviewDocument({ body, css, editable }) {
  const previewScript = `
    (() => {
      const root = document.getElementById("b2b-preview-root");
      if (!root) return;

      const EDITABLE_SELECTOR = "h1,h2,h3,h4,h5,h6,p,span,a,button,li,strong,small,label,.marquee-item";

      document.addEventListener("click", (event) => {
        const link = event.target.closest("a");
        if (link) event.preventDefault();
      });

      const setupEditable = () => {
        if (!${editable ? "true" : "false"}) return;

        const marqueeItems = Array.from(root.querySelectorAll('.marquee-item')).filter((el) => el.textContent && el.textContent.trim());
        const textElements = Array.from(root.querySelectorAll(EDITABLE_SELECTOR)).filter((el) => {
          if (el.classList.contains('marquee-item')) return false;
          if (el.closest('.marquee-item')) return false;
          if (!el.textContent || !el.textContent.trim()) return false;
          return !el.querySelector('h1,h2,h3,h4,h5,h6,p,span,a,button,li,strong,small,label');
        });
        const elements = [...marqueeItems, ...textElements];

        elements.forEach((el) => {
          el.setAttribute("data-b2b-editable", "true");
          el.setAttribute("contenteditable", "true");
          el.addEventListener("blur", () => {
            window.parent.postMessage(
              { type: "B2B_PREVIEW_HTML_UPDATE", html: root.innerHTML },
              "*"
            );
          });
          el.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              el.blur();
            }
            if (event.key === "Enter" && el.tagName !== "P" && el.tagName !== "LI") {
              event.preventDefault();
              el.blur();
            }
          });
        });
      };

      setupEditable();
    })();
  `;

  return `<!DOCTYPE html>
  <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
      <style>
        body { margin: 0; }
        [data-b2b-editable="true"] {
          cursor: text;
          outline: none;
          border-radius: 4px;
          transition: background .2s ease, box-shadow .2s ease;
        }
        [data-b2b-editable="true"]:hover {
          background: rgba(37, 99, 235, 0.10);
        }
        [data-b2b-editable="true"]:focus {
          background: rgba(37, 99, 235, 0.14);
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.35);
        }
      </style>
      <style>${css}</style>
    </head>
    <body>
      <div id="b2b-preview-root">${body}</div>
      <script>${previewScript}</script>
    </body>
  </html>`;
}

function textareaStyle(T) {
  return {
    width: "100%",
    minHeight: 360,
    padding: 16,
    background: T.bgCard,
    border: `1px solid ${T.border}`,
    borderRadius: 16,
    color: T.text,
    fontSize: 13,
    fontFamily: "monospace",
    lineHeight: 1.5,
    outline: "none",
    resize: "vertical",
  };
}

function ViewportButton({ active, onClick, icon, label, T, hideLabel }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        padding: "8px 12px",
        borderRadius: 8,
        border: "none",
        background: active ? T.accent : "transparent",
        color: active ? "#fff" : T.muted,
        fontSize: 12,
        fontWeight: 800,
        cursor: "pointer",
        transition: "all 0.15s",
        whiteSpace: "nowrap",
      }}
    >
      <i className={`bi ${icon}`}></i>
      {!hideLabel && label}
    </button>
  );
}
