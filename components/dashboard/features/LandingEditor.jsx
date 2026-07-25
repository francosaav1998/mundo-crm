"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import RippleButton from "@/components/ui/RippleButton";
import { useLandingEditor } from "../hooks/useLandingEditor";
import {
  HeroControls,
  SellerControls,
  PlansControls,
  BenefitsControls,
  CoverageControls,
  HeaderControls,
  FooterControls,
} from "./landing/LandingControls";

const SECTIONS = [
  { id: "hero", label: "Hero", icon: "bi-house-door-fill" },
  { id: "seller", label: "Vendedor", icon: "bi-person-badge-fill" },
  { id: "plans", label: "Planes", icon: "bi-wifi-fill" },
  { id: "benefits", label: "Beneficios", icon: "bi-stars" },
  { id: "coverage", label: "Cobertura", icon: "bi-geo-alt-fill" },
  { id: "header", label: "Header", icon: "bi-layout-text-window-reverse" },
  { id: "footer", label: "Footer", icon: "bi-layout-text-sidebar-reverse" },
];

export default function LandingEditor({ sellerInfo, T, isMobile, showToast }) {
  const {
    loading,
    saving,
    dirty,
    activeSection,
    setActiveSection,
    content,
    plans,
    profile,
    company,
    previewMode,
    setPreviewMode,
    updateContent,
    updateArrayItem,
    addArrayItem,
    removeArrayItem,
    updateProfile,
    updatePlan,
    addPlan,
    removePlan,
    updatePlanFeature,
    addPlanFeature,
    removePlanFeature,
    save,
  } = useLandingEditor({ sellerInfo, showToast });

  const [iframeReady, setIframeReady] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const iframeRef = useRef(null);

  const sellerSlug = sellerInfo?.slug || "";
  const previewUrl = sellerSlug ? `/p/${sellerSlug}?preview=1` : "";

  const handleSave = async () => {
    await save();
  };

  const handlePhotoUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "seller");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al subir foto");
      updateProfile({ photo: data.url });
      showToast("Foto actualizada");
    } catch (err) {
      showToast(err.message || "Error al subir foto");
    } finally {
      setUploadingPhoto(false);
    }
  }, [updateProfile, showToast]);

  const applyPreviewEdit = useCallback((path, value) => {
    const parts = path.split(".");
    if (parts[0] === "profile") {
      updateProfile({ [parts[1]]: value });
      setActiveSection("seller");
      return;
    }
    if (parts[0] === "plan" && !Number.isNaN(Number(parts[1]))) {
      const planIndex = Number(parts[1]);
      const field = parts[2];
      if (field === "features") {
        const featureIndex = Number(parts[3]);
        const featureField = parts[4];
        updatePlanFeature(planIndex, featureIndex, { [featureField]: value });
      } else {
        updatePlan(planIndex, { [field]: value });
      }
      setActiveSection("plans");
      return;
    }
    const arrayKeys = new Set(["stats", "items", "steps", "navLinks", "links"]);
    const section = parts[0];
    const sub = parts[1];
    if (sub === "header") {
      updateContent(section, { [parts[2]]: value });
    } else if (arrayKeys.has(sub)) {
      const index = Number(parts[2]);
      const field = parts[3];
      updateArrayItem(section, sub, index, { [field]: value });
    } else {
      updateContent(section, { [sub]: value });
    }
    setActiveSection(section);
  }, [
    updateProfile,
    updatePlan,
    updatePlanFeature,
    updateContent,
    updateArrayItem,
    setActiveSection,
  ]);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.source !== iframeRef.current?.contentWindow) return;
      const data = event.data;
      if (!data || typeof data !== "object") return;
      if (data.type === "LANDING_PREVIEW_READY") {
        setIframeReady(true);
      } else if (data.type === "LANDING_PREVIEW_SECTION_SELECTED" && data.sectionId) {
        setActiveSection(data.sectionId);
      } else if (data.type === "LANDING_PREVIEW_TEXT_EDIT" && data.payload) {
        applyPreviewEdit(data.payload.path, data.payload.value);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [isMobile, setActiveSection, applyPreviewEdit]);

  useEffect(() => {
    if (!iframeReady || !previewUrl) return;
    iframeRef.current?.contentWindow?.postMessage(
      {
        type: "LANDING_PREVIEW_UPDATE",
        payload: {
          content,
          plans: plans.filter((p) => p.sellerActive !== false),
          profile,
          company,
        },
      },
      window.location.origin
    );
  }, [iframeReady, content, plans, profile, company, previewUrl]);

  useEffect(() => {
    if (!iframeReady || !activeSection) return;
    iframeRef.current?.contentWindow?.postMessage(
      {
        type: "LANDING_PREVIEW_FOCUS",
        sectionId: activeSection,
      },
      window.location.origin
    );
  }, [iframeReady, activeSection]);

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
        height: "calc(100vh - 120px)",
        minHeight: isMobile ? "calc(100vh - 120px)" : 700,
      }}
    >
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
              Editor de Landing
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
              {dirty ? (
                <>
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: "#F59E0B",
                      boxShadow: "0 0 8px rgba(245,158,11,0.6)",
                    }}
                  />
                  <span style={{ fontSize: 11, color: "#F59E0B", fontWeight: 700 }}>Sin guardar</span>
                </>
              ) : (
                <span style={{ fontSize: 11, color: T.muted }}>Todo guardado</span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {/* Viewport toggle */}
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

          {sellerSlug && (
            <a
              href={`/p/${sellerSlug}`}
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
          )}

          <RippleButton
            onClick={handleSave}
            disabled={saving}
            loading={saving}
            loadingText="Guardando..."
            style={{
              padding: "10px 18px",
              borderRadius: 10,
              border: "none",
              background: `linear-gradient(135deg, ${T.accent} 0%, #0077A8 100%)`,
              color: "#fff",
              fontWeight: 800,
              fontSize: 13,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              whiteSpace: "nowrap",
              boxShadow: `0 6px 18px ${T.accent}35`,
            }}
          >
            <i className="bi bi-check-lg"></i>
            {isMobile ? "Guardar" : "Guardar Cambios"}
          </RippleButton>
        </div>
      </div>

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
        {/* Sidebar - editor manual (solo escritorio) */}
        {!isMobile && (
          <div
            style={{
              width: 420,
              minWidth: 420,
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              background: T.bgCard,
              border: `1px solid ${T.border}`,
              borderRadius: 20,
              overflow: "hidden",
              boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
              height: "100%",
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
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "16px",
              }}
            >
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
                También podés editar directamente desde la vista previa: hacé clic sobre cualquier texto, cambialo y los cambios se reflejan automáticamente.
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
                {!activeSection && (
                  <div style={{ color: T.muted, fontSize: 14, textAlign: "center", padding: 30 }}>
                    Selecciona una sección para editar manualmente.
                  </div>
                )}
                {activeSection === "hero" && (
                  <HeroControls content={content.hero} updateContent={(u) => updateContent("hero", u)} T={T} isMobile={isMobile} />
                )}
                {activeSection === "seller" && (
                  <SellerControls
                    content={content.seller}
                    updateContent={(u) => updateContent("seller", u)}
                    profile={profile}
                    updateProfile={updateProfile}
                    onPhotoUpload={handlePhotoUpload}
                    uploadingPhoto={uploadingPhoto}
                    T={T}
                    isMobile={isMobile}
                  />
                )}
                {activeSection === "plans" && (
                  <PlansControls
                    content={content.plans}
                    updateContent={(u) => updateContent("plans", u)}
                    plans={plans}
                    updatePlan={updatePlan}
                    addPlan={addPlan}
                    removePlan={removePlan}
                    updatePlanFeature={updatePlanFeature}
                    addPlanFeature={addPlanFeature}
                    removePlanFeature={removePlanFeature}
                    T={T}
                    isMobile={isMobile}
                  />
                )}
                {activeSection === "benefits" && (
                  <BenefitsControls
                    content={content.benefits}
                    updateContent={(u) => updateContent("benefits", u)}
                    updateArrayItem={(k, i, v) => updateArrayItem("benefits", k, i, v)}
                    addArrayItem={(k, t) => addArrayItem("benefits", k, t)}
                    removeArrayItem={(k, i) => removeArrayItem("benefits", k, i)}
                    T={T}
                    isMobile={isMobile}
                  />
                )}
                {activeSection === "coverage" && (
                  <CoverageControls
                    content={content.coverage}
                    updateContent={(u) => updateContent("coverage", u)}
                    updateArrayItem={(k, i, v) => updateArrayItem("coverage", k, i, v)}
                    addArrayItem={(k, t) => addArrayItem("coverage", k, t)}
                    removeArrayItem={(k, i) => removeArrayItem("coverage", k, i)}
                    T={T}
                    isMobile={isMobile}
                  />
                )}
                {activeSection === "header" && (
                  <HeaderControls
                    content={content.header}
                    updateContent={(u) => updateContent("header", u)}
                    updateArrayItem={(k, i, v) => updateArrayItem("header", k, i, v)}
                    addArrayItem={(k, t) => addArrayItem("header", k, t)}
                    removeArrayItem={(k, i) => removeArrayItem("header", k, i)}
                    T={T}
                    isMobile={isMobile}
                  />
                )}
                {activeSection === "footer" && (
                  <FooterControls
                    content={content.footer}
                    updateContent={(u) => updateContent("footer", u)}
                    updateArrayItem={(k, i, v) => updateArrayItem("footer", k, i, v)}
                    addArrayItem={(k, t) => addArrayItem("footer", k, t)}
                    removeArrayItem={(k, i) => removeArrayItem("footer", k, i)}
                    T={T}
                    isMobile={isMobile}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Preview canvas */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            height: "100%",
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
                {isMobile ? "Vista móvil" : previewMode === "mobile" ? "Vista móvil" : "Vista escritorio"}
              </span>
            </div>
            <span style={{ fontSize: 11, color: T.muted }}>
              {iframeReady ? "Haz click en el texto para editar" : "Cargando preview..."}
            </span>
          </div>
          <div
            style={{
              flex: 1,
              overflow: "auto",
              display: "flex",
              justifyContent: isMobile || previewMode === "mobile" ? "center" : "flex-start",
              background: "rgba(0,0,0,0.05)",
            }}
          >
            {previewUrl ? (
              <iframe
                ref={iframeRef}
                src={previewUrl}
                onLoad={() => setIframeReady(false)}
                title="Vista previa de landing"
                style={{
                  width: isMobile ? "100%" : previewMode === "mobile" ? 390 : "100%",
                  minWidth: isMobile ? "100%" : previewMode === "mobile" ? 390 : "100%",
                  height: "100%",
                  border: "none",
                  background: "#fff",
                }}
              />
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", color: T.muted, fontSize: 13 }}>
                Guarda tu slug de vendedor para ver la vista previa.
              </div>
            )}
          </div>
        </div>
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

