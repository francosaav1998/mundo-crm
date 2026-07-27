"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { DEFAULT_B2B_CONTENT, mergeB2BContent } from "@/lib/b2b-content";
import RippleButton from "@/components/ui/RippleButton";
import SectionHeader from "@/components/dashboard/ui/SectionHeader";
import {
  B2BHeaderControls,
  B2BHeroControls,
  B2BCompaniesControls,
  B2BBenefitsControls,
  B2BCtaControls,
  B2BFooterControls,
} from "./landing/B2BControls";

const SECTIONS = [
  { id: "hero", label: "Hero", icon: "bi-house-door-fill" },
  { id: "companies", label: "Compañías", icon: "bi-buildings-fill" },
  { id: "benefits", label: "Beneficios", icon: "bi-stars" },
  { id: "cta", label: "CTA Final", icon: "bi-cursor-fill" },
  { id: "header", label: "Header", icon: "bi-layout-text-window-reverse" },
  { id: "footer", label: "Footer", icon: "bi-layout-text-sidebar-reverse" },
];

export default function B2BLandingEditor({ T, isMobile, showToast }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [content, setContent] = useState(DEFAULT_B2B_CONTENT);
  const [previewMode, setPreviewMode] = useState("desktop");
  const [mobileTab, setMobileTab] = useState("edit");
  const [activeSection, setActiveSection] = useState("hero");
  const [iframeReady, setIframeReady] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/b2b-landing");
        if (res.ok) {
          const data = await res.json();
          setContent(mergeB2BContent(data.content));
        }
      } catch (err) {
        showToast(err.message || "Error al cargar landing");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [showToast]);

  const updateSection = useCallback((section, updates) => {
    setDirty(true);
    setContent((prev) => ({
      ...prev,
      [section]: { ...prev[section], ...updates },
    }));
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/b2b-landing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error();
      setDirty(false);
      showToast("Landing B2B guardada correctamente");
      if (isMobile) setMobileTab("preview");
    } catch (err) {
      showToast(err.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  }, [content, showToast, isMobile]);

  const handleReset = useCallback(() => {
    if (confirm("¿Restaurar el contenido por defecto? Se perderán los cambios no guardados.")) {
      setContent(DEFAULT_B2B_CONTENT);
      setDirty(true);
    }
  }, []);

  // Escuchar el READY del iframe de vista previa.
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.source !== iframeRef.current?.contentWindow) return;
      if (event.data?.type === "B2B_PREVIEW_READY") {
        setIframeReady(true);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Enviar cambios en vivo a la vista previa.
  useEffect(() => {
    if (!iframeReady) return;
    iframeRef.current?.contentWindow?.postMessage(
      { type: "B2B_PREVIEW_UPDATE", content },
      window.location.origin
    );
  }, [iframeReady, content]);

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
        description="Edita cada sección manualmente y mira los cambios en vivo. Al guardar se publican en la página de inicio."
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
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
              {dirty ? (
                <>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#F59E0B", boxShadow: "0 0 8px rgba(245,158,11,0.6)" }} />
                  <span style={{ fontSize: 11, color: "#F59E0B", fontWeight: 700 }}>Sin guardar</span>
                </>
              ) : (
                <span style={{ fontSize: 11, color: T.muted }}>Todo guardado</span>
              )}
            </div>
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
        {/* Sidebar - edición manual por secciones */}
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
            {/* Section tabs */}
            <div
              style={{
                display: "flex",
                gap: 6,
                overflowX: "auto",
                padding: "12px 14px",
                borderBottom: `1px solid ${T.border}`,
                background: `${T.accent}04`,
              }}
            >
              {SECTIONS.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 12px",
                    borderRadius: 10,
                    border: "none",
                    background: activeSection === section.id ? T.accent : T.bgCard,
                    color: activeSection === section.id ? "#fff" : T.muted,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.15s",
                  }}
                >
                  <i className={`bi ${section.icon}`}></i>
                  {section.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
              <div
                style={{
                  background: `${T.accent}10`,
                  border: `1px solid ${T.accent}25`,
                  borderRadius: 12,
                  padding: 14,
                  marginBottom: 16,
                  fontSize: 13,
                  color: T.muted,
                  lineHeight: 1.5,
                }}
              >
                <i className="bi bi-info-circle-fill" style={{ color: T.accent, marginRight: 8 }}></i>
                Edita los campos de cada sección. La vista previa se actualiza en vivo y al guardar se publica en la página de inicio <strong>/</strong>.
              </div>
              <div
                style={{
                  background: T.inputBg,
                  border: `1px solid ${T.border}`,
                  borderRadius: 18,
                  padding: "16px",
                  minHeight: "100%",
                }}
              >
                {activeSection === "hero" && (
                  <B2BHeroControls content={content.hero} updateSection={(u) => updateSection("hero", u)} T={T} isMobile={isMobile} />
                )}
                {activeSection === "companies" && (
                  <B2BCompaniesControls content={content.companies} updateSection={(u) => updateSection("companies", u)} T={T} />
                )}
                {activeSection === "benefits" && (
                  <B2BBenefitsControls content={content.benefits} updateSection={(u) => updateSection("benefits", u)} T={T} isMobile={isMobile} />
                )}
                {activeSection === "cta" && (
                  <B2BCtaControls content={content.cta} updateSection={(u) => updateSection("cta", u)} T={T} />
                )}
                {activeSection === "header" && (
                  <B2BHeaderControls content={content.header} updateSection={(u) => updateSection("header", u)} T={T} />
                )}
                {activeSection === "footer" && (
                  <B2BFooterControls content={content.footer} updateSection={(u) => updateSection("footer", u)} T={T} />
                )}
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
                {iframeReady ? "Se actualiza en vivo" : "Cargando preview..."}
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
                src="/?preview=1"
                onLoad={() => setIframeReady(false)}
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
