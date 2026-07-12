"use client";

import { useEffect, useState } from "react";
import { useLandingEditor } from "../hooks/useLandingEditor";
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
    activeSection,
    setActiveSection,
    content,
    plans,
    sellerData,
    updateContent,
    updateArrayItem,
    addArrayItem,
    removeArrayItem,
    updatePlan,
    updatePlanFeature,
    addPlanFeature,
    removePlanFeature,
    save,
  } = useLandingEditor({ sellerInfo, showToast });

  const seller = sellerData || sellerInfo;

  const handleSave = async () => {
    await save();
  };

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
        flexDirection: isMobile ? "column" : "row",
        gap: isMobile ? 12 : 20,
        height: isMobile ? "auto" : "calc(100vh - 120px)",
        minHeight: isMobile ? "auto" : 700,
      }}
    >
      {/* Panel de edición */}
      <div
        style={{
          width: "100%",
            minWidth: isMobile ? "auto" : 480,
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            background: T.bgCard,
            border: `1px solid ${T.border}`,
            borderRadius: 24,
            overflow: "hidden",
            boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
            height: isMobile ? "auto" : "100%",
          }}
        >
          {/* Header del editor */}
          <div
            style={{
              padding: isMobile ? "14px 16px" : "18px 22px",
              borderBottom: `1px solid ${T.border}`,
              background: `${T.accent}08`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
              <div>
                <h2 style={{ fontSize: isMobile ? 16 : 18, fontWeight: 800, color: T.text, margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
                  <i className="bi bi-palette-fill" style={{ color: T.accent }}></i>
                  Editor de Landing
                </h2>
                <p style={{ fontSize: 12, color: T.muted, margin: "6px 0 0 0" }}>
                  Personaliza textos, botones, planes y más.
                </p>
              </div>
              <a
                href={seller?.slug ? `/p/${seller.slug}` : "/"}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  borderRadius: 999,
                  background: `${T.accent}15`,
                  border: `1px solid ${T.accent}35`,
                  color: T.accent,
                  fontSize: 12,
                  fontWeight: 700,
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                <i className="bi bi-eye-fill"></i> Ver publicada
              </a>
            </div>

            {/* Tabs de sección */}
            <div
              style={{
                display: "flex",
                gap: 6,
                overflowX: "auto",
                paddingBottom: 4,
                scrollbarWidth: "thin",
              }}
            >
              {SECTIONS.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: isMobile ? "8px 12px" : "10px 16px",
                    borderRadius: 12,
                    border: "none",
                    background: activeSection === section.id ? T.accent : "transparent",
                    color: activeSection === section.id ? "#fff" : T.muted,
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    transition: "all 0.2s",
                    boxShadow: activeSection === section.id ? `0 4px 14px ${T.accent}50` : "none",
                  }}
                >
                  <i className={`bi ${section.icon}`}></i>
                  {section.label}
                </button>
              ))}
            </div>
          </div>

          {/* Controles de la sección activa */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: isMobile ? "16px" : "22px",
            }}
          >
            <div
              style={{
                background: T.inputBg,
                border: `1px solid ${T.border}`,
                borderRadius: 20,
                padding: isMobile ? "16px" : "22px",
              }}
            >
              {activeSection === "hero" && (
                <HeroControls content={content.hero} updateContent={(u) => updateContent("hero", u)} T={T} isMobile={isMobile} />
              )}
              {activeSection === "seller" && (
                <SellerControls content={content.seller} updateContent={(u) => updateContent("seller", u)} T={T} isMobile={isMobile} />
              )}
              {activeSection === "plans" && (
                <PlansControls
                  content={content.plans}
                  updateContent={(u) => updateContent("plans", u)}
                  plans={plans}
                  updatePlan={updatePlan}
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

          {/* Botón guardar */}
          <div style={{ padding: isMobile ? "14px 16px" : "18px 22px", borderTop: `1px solid ${T.border}`, background: T.bgCard }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: 14,
                border: "none",
                background: `linear-gradient(135deg, ${T.accent} 0%, #0077A8 100%)`,
                color: "#fff",
                fontWeight: 800,
                fontSize: 15,
                cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.7 : 1,
                boxShadow: `0 8px 24px ${T.accent}40`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <i className={`bi ${saving ? "bi-arrow-clockwise" : "bi-check-lg"}`}></i>
              {saving ? "Guardando cambios..." : "Guardar Cambios"}
            </button>
          </div>
        </div>
      </div>
  );
}

function Input({ T, style, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      style={{ ...inputStyle(T, focused), ...style }}
      onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
      onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
    />
  );
}

function Textarea({ T, rows = 3, style, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      {...props}
      rows={rows}
      style={{ ...textareaStyle(T, focused), ...style }}
      onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
      onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
    />
  );
}

function inputStyle(T, focused = false) {
  return {
    width: "100%",
    padding: "14px 16px",
    background: T.bgCard,
    border: `1px solid ${focused ? T.accent : T.border}`,
    borderRadius: 12,
    color: T.text,
    fontSize: 15,
    outline: "none",
    fontFamily: "inherit",
    transition: "all 0.2s",
    boxShadow: focused ? `0 0 0 3px ${T.accent}20` : "none",
  };
}

function labelStyle(T) {
  return {
    display: "block",
    fontSize: 12,
    fontWeight: 700,
    color: T.text,
    marginBottom: 8,
  };
}

function textareaStyle(T, focused = false) {
  return {
    ...inputStyle(T, focused),
    resize: "vertical",
    minHeight: 80,
    lineHeight: 1.6,
  };
}

function helperStyle(T) {
  return {
    fontSize: 12,
    color: T.muted,
    marginTop: 6,
    lineHeight: 1.5,
  };
}

function SectionBlock({ title, children, T }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h3 style={{ fontSize: 15, fontWeight: 800, color: T.accent, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
        <i className="bi bi-chevron-right" style={{ fontSize: 12 }}></i>
        {title}
      </h3>
      {children}
    </div>
  );
}

function Field({ label, help, T, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={labelStyle(T)}>{label}</label>
      {children}
      {help && <p style={helperStyle(T)}>{help}</p>}
    </div>
  );
}

function HeroControls({ content, updateContent, T, isMobile = false }) {
  return (
    <>
      <SectionBlock title="Badge / Etiqueta" T={T}>
        <Field label="Texto del badge" help="Aparece arriba del título principal." T={T}>
          <Input type="text" T={T} value={content.badge || ""} onChange={(e) => updateContent({ badge: e.target.value })} />
        </Field>
      </SectionBlock>
      <SectionBlock title="Título Principal" T={T}>
        <Field label="Título (parte 1)" T={T}>
          <Input type="text" T={T} value={content.title || ""} onChange={(e) => updateContent({ title: e.target.value })} />
        </Field>
        <Field label="Título resaltado" help="Aparece en color amarillo/acento." T={T}>
          <Input type="text" T={T} value={content.titleHighlight || ""} onChange={(e) => updateContent({ titleHighlight: e.target.value })} />
        </Field>
      </SectionBlock>
      <SectionBlock title="Descripción y Botones" T={T}>
        <Field label="Descripción" T={T}>
          <Textarea T={T} value={content.description || ""} onChange={(e) => updateContent({ description: e.target.value })} rows={3} />
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
          <Field label="Botón primario" T={T}>
            <Input type="text" T={T} value={content.ctaPrimary || ""} onChange={(e) => updateContent({ ctaPrimary: e.target.value })} />
          </Field>
          <Field label="Botón secundario" T={T}>
            <Input type="text" T={T} value={content.ctaSecondary || ""} onChange={(e) => updateContent({ ctaSecondary: e.target.value })} />
          </Field>
        </div>
      </SectionBlock>
      <SectionBlock title="Tarjeta Destacada" T={T}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
          <Field label="Badge de tarjeta" T={T}>
            <Input type="text" T={T} value={content.cardBadge || ""} onChange={(e) => updateContent({ cardBadge: e.target.value })} />
          </Field>
          <Field label="Sufijo del título" T={T}>
            <Input type="text" T={T} value={content.cardTitleSuffix || ""} onChange={(e) => updateContent({ cardTitleSuffix: e.target.value })} />
          </Field>
        </div>
      </SectionBlock>
    </>
  );
}

function SellerControls({ content, updateContent, T, isMobile = false }) {
  return (
    <>
      <SectionBlock title="Presentación" T={T}>
        <Field label="Subtítulo / Eyebrow" T={T}>
          <Input type="text" T={T} value={content.eyebrow || ""} onChange={(e) => updateContent({ eyebrow: e.target.value })} />
        </Field>
        <Field label="Texto del botón" T={T}>
          <Input type="text" T={T} value={content.cta || ""} onChange={(e) => updateContent({ cta: e.target.value })} />
        </Field>
      </SectionBlock>
      <SectionBlock title="Estadísticas" T={T}>
        {(content.stats || []).map((stat, idx) => (
          <div key={idx} style={{ display: "flex", gap: 12, marginBottom: 10 }}>
            <Input
              type="text"
              T={T}
              value={stat.num}
              onChange={(e) => updateContent({ stats: content.stats.map((s, i) => (i === idx ? { ...s, num: e.target.value } : s)) })}
              style={{ flex: 1 }}
              placeholder="Ej: 5 Min"
            />
            <Input
              type="text"
              T={T}
              value={stat.label}
              onChange={(e) => updateContent({ stats: content.stats.map((s, i) => (i === idx ? { ...s, label: e.target.value } : s)) })}
              style={{ flex: 2 }}
              placeholder="Ej: Evaluación Cobertura"
            />
          </div>
        ))}
      </SectionBlock>
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
        <i className="bi bi-info-circle-fill" style={{ color: T.accent, marginRight: 8 }}></i>
        La foto, nombre y bio del vendedor se editan en <strong style={{ color: T.text }}>Configuración &gt; Perfil</strong>.
      </div>
    </>
  );
}

function PlansControls({ content, updateContent, plans, updatePlan, updatePlanFeature, addPlanFeature, removePlanFeature, T, isMobile = false }) {
  return (
    <>
      <SectionBlock title="Encabezado de Planes" T={T}>
        <Field label="Título" T={T}>
          <Input type="text" T={T} value={content.title || ""} onChange={(e) => updateContent({ title: e.target.value })} />
        </Field>
        <Field label="Texto resaltado" T={T}>
          <Input type="text" T={T} value={content.titleHighlight || ""} onChange={(e) => updateContent({ titleHighlight: e.target.value })} />
        </Field>
        <Field label="Sufijo" T={T}>
          <Input type="text" T={T} value={content.titleSuffix || ""} onChange={(e) => updateContent({ titleSuffix: e.target.value })} />
        </Field>
        <Field label="Descripción" help="Usa {companyName} para insertar el nombre de la compañía." T={T}>
          <Input type="text" T={T} value={content.description || ""} onChange={(e) => updateContent({ description: e.target.value })} />
        </Field>
      </SectionBlock>

      <SectionBlock title="Planes Disponibles" T={T}>
        {plans.map((plan, idx) => (
          <PlanCardEditor
            key={plan.id}
            plan={plan}
            idx={idx}
            updatePlan={updatePlan}
            updatePlanFeature={updatePlanFeature}
            addPlanFeature={addPlanFeature}
            removePlanFeature={removePlanFeature}
            T={T}
            isMobile={isMobile}
          />
        ))}
      </SectionBlock>
    </>
  );
}

function PlanCardEditor({ plan, idx, updatePlan, updatePlanFeature, addPlanFeature, removePlanFeature, T, isMobile = false }) {
  const [open, setOpen] = useState(true);

  return (
    <div
      style={{
        marginBottom: 16,
        borderRadius: 16,
        border: `1px solid ${T.border}`,
        background: T.bgCard,
        overflow: "hidden",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 18px",
          background: "transparent",
          border: "none",
          color: T.text,
          cursor: "pointer",
          fontSize: 14,
          fontWeight: 700,
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: `${T.accent}20`,
              color: T.accent,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
            }}
          >
            {idx + 1}
          </span>
          {plan.title}
          {plan.featured && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                textTransform: "uppercase",
                padding: "3px 8px",
                borderRadius: 999,
                background: T.accent,
                color: "#fff",
              }}
            >
              Destacado
            </span>
          )}
        </span>
        <i className={`bi bi-chevron-${open ? "up" : "down"}`}></i>
      </button>

      {open && (
        <div style={{ padding: "0 18px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, paddingBottom: 14, borderBottom: `1px solid ${T.border}` }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: T.text, cursor: "pointer", fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={plan.sellerActive !== false}
                onChange={(e) => updatePlan(idx, { sellerActive: e.target.checked })}
                style={{ width: 18, height: 18, accentColor: T.accent }}
              />
              Mostrar en la landing
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: T.text, cursor: "pointer", fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={!!plan.featured}
                onChange={(e) => updatePlan(idx, { featured: e.target.checked })}
                style={{ width: 18, height: 18, accentColor: T.accent }}
              />
              Plan destacado
            </label>
          </div>

          <div style={{ display: "grid", gap: 14 }}>
            <Field label="Nombre del plan" T={T}>
              <Input type="text" T={T} value={plan.title} onChange={(e) => updatePlan(idx, { title: e.target.value })} />
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
              <Field label="Velocidad" T={T}>
                <Input type="text" T={T} value={plan.speed} onChange={(e) => updatePlan(idx, { speed: e.target.value })} />
              </Field>
              <Field label="Unidad / label" T={T}>
                <Input type="text" T={T} value={plan.speedLabel} onChange={(e) => updatePlan(idx, { speedLabel: e.target.value })} />
              </Field>
            </div>
            <Field label="Precio" T={T}>
              <Input type="text" T={T} value={plan.price} onChange={(e) => updatePlan(idx, { price: e.target.value })} />
            </Field>
            <Field label="Subtítulo de precio" T={T}>
              <Input type="text" T={T} value={plan.priceSubtitle} onChange={(e) => updatePlan(idx, { priceSubtitle: e.target.value })} />
            </Field>
          </div>

          <div style={{ marginTop: 18 }}>
            <span style={{ ...labelStyle(T), marginBottom: 10 }}>Características</span>
            {(plan.features || []).map((feature, fidx) => (
              <div key={fidx} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                <Input
                  type="text"
                  T={T}
                  value={feature.icon || ""}
                  onChange={(e) => updatePlanFeature(idx, fidx, { icon: e.target.value })}
                  style={{ width: 120 }}
                  placeholder="bi-check-circle-fill"
                />
                <Input
                  type="text"
                  T={T}
                  value={feature.text || ""}
                  onChange={(e) => updatePlanFeature(idx, fidx, { text: e.target.value })}
                  style={{ flex: 1 }}
                  placeholder="Texto de la característica"
                />
                <button
                  onClick={() => removePlanFeature(idx, fidx)}
                  style={{
                    width: 44,
                    borderRadius: 10,
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.18)",
                    color: "#EF4444",
                    cursor: "pointer",
                    fontSize: 16,
                  }}
                >
                  <i className="bi bi-trash3-fill"></i>
                </button>
              </div>
            ))}
            <button
              onClick={() => addPlanFeature(idx)}
              style={{
                marginTop: 4,
                padding: "10px 16px",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                color: T.accent,
                background: `${T.accent}10`,
                border: `1px solid ${T.accent}30`,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <i className="bi bi-plus-lg"></i> Agregar característica
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function BenefitsControls({ content, updateContent, updateArrayItem, addArrayItem, removeArrayItem, T, isMobile = false }) {
  return (
    <>
      <SectionBlock title="Encabezado" T={T}>
        <Field label="Título" T={T}>
          <Input type="text" T={T} value={content.title || ""} onChange={(e) => updateContent({ title: e.target.value })} />
        </Field>
        <Field label="Sufijo" T={T}>
          <Input type="text" T={T} value={content.titleSuffix || ""} onChange={(e) => updateContent({ titleSuffix: e.target.value })} />
        </Field>
        <Field label="Descripción" T={T}>
          <Input type="text" T={T} value={content.description || ""} onChange={(e) => updateContent({ description: e.target.value })} />
        </Field>
      </SectionBlock>
      <SectionBlock title="Beneficios" T={T}>
        {(content.items || []).map((item, idx) => (
          <div
            key={idx}
            style={{
              marginBottom: 14,
              padding: 16,
              borderRadius: 14,
              background: T.bgCard,
              border: `1px solid ${T.border}`,
            }}
          >
            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 12, marginBottom: 10 }}>
              <Input
                type="text"
                T={T}
                value={item.icon}
                onChange={(e) => updateArrayItem("items", idx, { icon: e.target.value })}
                style={{ width: isMobile ? "100%" : 100 }}
                placeholder="bi-stars"
              />
              <Input
                type="text"
                T={T}
                value={item.title}
                onChange={(e) => updateArrayItem("items", idx, { title: e.target.value })}
                style={{ flex: 1 }}
                placeholder="Título del beneficio"
              />
            </div>
            <Textarea
              T={T}
              value={item.description}
              onChange={(e) => updateArrayItem("items", idx, { description: e.target.value })}
              style={{ minHeight: 60 }}
              rows={2}
              placeholder="Descripción"
            />
            <button
              onClick={() => removeArrayItem("items", idx)}
              style={{
                marginTop: 10,
                padding: "8px 12px",
                borderRadius: 8,
                fontSize: 12,
                color: "#EF4444",
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.18)",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              <i className="bi bi-trash3-fill"></i> Eliminar
            </button>
          </div>
        ))}
        <button
          onClick={() => addArrayItem("items", { icon: "bi-stars", title: "Nuevo beneficio", description: "Descripción del beneficio." })}
          style={{
            padding: "10px 16px",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            color: T.accent,
            background: `${T.accent}10`,
            border: `1px solid ${T.accent}30`,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <i className="bi bi-plus-lg"></i> Agregar beneficio
        </button>
      </SectionBlock>
    </>
  );
}

function CoverageControls({ content, updateContent, updateArrayItem, addArrayItem, removeArrayItem, T, isMobile = false }) {
  return (
    <>
      <SectionBlock title="Encabezado" T={T}>
        <Field label="Título" T={T}>
          <Input type="text" T={T} value={content.title || ""} onChange={(e) => updateContent({ title: e.target.value })} />
        </Field>
        <Field label="Texto resaltado" T={T}>
          <Input type="text" T={T} value={content.titleHighlight || ""} onChange={(e) => updateContent({ titleHighlight: e.target.value })} />
        </Field>
        <Field label="Descripción" help="Usa {executive} para insertar el label del vendedor." T={T}>
          <Textarea T={T} value={content.description || ""} onChange={(e) => updateContent({ description: e.target.value })} rows={3} />
        </Field>
      </SectionBlock>
      <SectionBlock title="Pasos" T={T}>
        {(content.steps || []).map((step, idx) => (
          <div
            key={idx}
            style={{
              marginBottom: 12,
              padding: 14,
              borderRadius: 14,
              background: T.bgCard,
              border: `1px solid ${T.border}`,
            }}
          >
            <Input
              type="text"
              T={T}
              value={step.title}
              onChange={(e) => updateArrayItem("steps", idx, { title: e.target.value })}
              style={{ marginBottom: 10 }}
              placeholder="Título del paso"
            />
            <Textarea
              T={T}
              value={step.description}
              onChange={(e) => updateArrayItem("steps", idx, { description: e.target.value })}
              style={{ minHeight: 60 }}
              rows={2}
              placeholder="Descripción"
            />
            <button
              onClick={() => removeArrayItem("steps", idx)}
              style={{
                marginTop: 10,
                padding: "8px 12px",
                borderRadius: 8,
                fontSize: 12,
                color: "#EF4444",
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.18)",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              <i className="bi bi-trash3-fill"></i> Eliminar
            </button>
          </div>
        ))}
        <button
          onClick={() => addArrayItem("steps", { title: "Nuevo paso", description: "Descripción del paso." })}
          style={{
            padding: "10px 16px",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            color: T.accent,
            background: `${T.accent}10`,
            border: `1px solid ${T.accent}30`,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <i className="bi bi-plus-lg"></i> Agregar paso
        </button>
      </SectionBlock>
      <SectionBlock title="Formulario" T={T}>
        <Field label="Título del formulario" T={T}>
          <Input type="text" T={T} value={content.formTitle || ""} onChange={(e) => updateContent({ formTitle: e.target.value })} />
        </Field>
        <Field label="Texto del botón" T={T}>
          <Input type="text" T={T} value={content.submitLabel || ""} onChange={(e) => updateContent({ submitLabel: e.target.value })} />
        </Field>
      </SectionBlock>
    </>
  );
}

function HeaderControls({ content, updateContent, updateArrayItem, addArrayItem, removeArrayItem, T, isMobile = false }) {
  return (
    <>
      <SectionBlock title="Barra Superior" T={T}>
        <Field label="Horario" T={T}>
          <Input type="text" T={T} value={content.topHours || ""} onChange={(e) => updateContent({ topHours: e.target.value })} />
        </Field>
        <Field label="Cobertura" T={T}>
          <Input type="text" T={T} value={content.topCoverage || ""} onChange={(e) => updateContent({ topCoverage: e.target.value })} />
        </Field>
      </SectionBlock>
      <SectionBlock title="Navegación" T={T}>
        {(content.navLinks || []).map((link, idx) => (
          <div key={idx} style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 10, marginBottom: 10 }}>
            <Input
              type="text"
              T={T}
              value={link.id}
              onChange={(e) => updateArrayItem("navLinks", idx, { id: e.target.value })}
              style={{ flex: 1 }}
              placeholder="ID sección"
            />
            <Input
              type="text"
              T={T}
              value={link.label}
              onChange={(e) => updateArrayItem("navLinks", idx, { label: e.target.value })}
              style={{ flex: 2 }}
              placeholder="Texto visible"
            />
            <button
              onClick={() => removeArrayItem("navLinks", idx)}
              style={{
                width: 44,
                borderRadius: 10,
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.18)",
                color: "#EF4444",
                cursor: "pointer",
                fontSize: 16,
              }}
            >
              <i className="bi bi-trash3-fill"></i>
            </button>
          </div>
        ))}
        <button
          onClick={() => addArrayItem("navLinks", { id: "seccion", label: "Nuevo link" })}
          style={{
            padding: "10px 16px",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            color: T.accent,
            background: `${T.accent}10`,
            border: `1px solid ${T.accent}30`,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <i className="bi bi-plus-lg"></i> Agregar link
        </button>
      </SectionBlock>
      <SectionBlock title="Botón CTA" T={T}>
        <Field label="Texto del botón" T={T}>
          <Input type="text" T={T} value={content.cta || ""} onChange={(e) => updateContent({ cta: e.target.value })} />
        </Field>
      </SectionBlock>
    </>
  );
}

function FooterControls({ content, updateContent, updateArrayItem, addArrayItem, removeArrayItem, T, isMobile = false }) {
  return (
    <>
      <SectionBlock title="Navegación" T={T}>
        <Field label="Título de navegación" T={T}>
          <Input type="text" T={T} value={content.navTitle || ""} onChange={(e) => updateContent({ navTitle: e.target.value })} />
        </Field>
        {(content.links || []).map((link, idx) => (
          <div key={idx} style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 10, marginBottom: 10 }}>
            <Input
              type="text"
              T={T}
              value={link.id}
              onChange={(e) => updateArrayItem("links", idx, { id: e.target.value })}
              style={{ flex: 1 }}
              placeholder="ID sección"
            />
            <Input
              type="text"
              T={T}
              value={link.label}
              onChange={(e) => updateArrayItem("links", idx, { label: e.target.value })}
              style={{ flex: 2 }}
              placeholder="Texto visible"
            />
            <button
              onClick={() => removeArrayItem("links", idx)}
              style={{
                width: 44,
                borderRadius: 10,
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.18)",
                color: "#EF4444",
                cursor: "pointer",
                fontSize: 16,
              }}
            >
              <i className="bi bi-trash3-fill"></i>
            </button>
          </div>
        ))}
        <button
          onClick={() => addArrayItem("links", { id: "seccion", label: "Nuevo link" })}
          style={{
            padding: "10px 16px",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            color: T.accent,
            background: `${T.accent}10`,
            border: `1px solid ${T.accent}30`,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <i className="bi bi-plus-lg"></i> Agregar link
        </button>
      </SectionBlock>
      <SectionBlock title="Contacto" T={T}>
        <Field label="Título de contacto" help="Usa {executiveLabel} para el label del vendedor." T={T}>
          <Input type="text" T={T} value={content.contactTitle || ""} onChange={(e) => updateContent({ contactTitle: e.target.value })} />
        </Field>
        <Field label="Label de nombre" help="Usa {executiveLabel} para el label del vendedor." T={T}>
          <Input type="text" T={T} value={content.nameLabel || ""} onChange={(e) => updateContent({ nameLabel: e.target.value })} />
        </Field>
        <Field label="Label de WhatsApp" T={T}>
          <Input type="text" T={T} value={content.whatsappLabel || ""} onChange={(e) => updateContent({ whatsappLabel: e.target.value })} />
        </Field>
      </SectionBlock>
      <SectionBlock title="Legal" T={T}>
        <Field label="Texto legal" help="Usa {companyName} y {executive} como variables dinámicas." T={T}>
          <Textarea T={T} value={content.bottomText || ""} onChange={(e) => updateContent({ bottomText: e.target.value })} rows={5} />
        </Field>
      </SectionBlock>
    </>
  );
}
