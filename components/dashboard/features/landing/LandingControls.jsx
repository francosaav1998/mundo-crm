"use client";

import { useState } from "react";
import Image from "next/image";
import { uploadImage } from "@/lib/upload-image";

export function Input({ T, style, ...props }) {
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

export function Textarea({ T, rows = 3, style, ...props }) {
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

export function inputStyle(T, focused = false) {
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

export function labelStyle(T) {
  return {
    display: "block",
    fontSize: 12,
    fontWeight: 700,
    color: T.text,
    marginBottom: 8,
  };
}

export function textareaStyle(T, focused = false) {
  return {
    ...inputStyle(T, focused),
    resize: "vertical",
    minHeight: 80,
    lineHeight: 1.6,
  };
}

export function helperStyle(T) {
  return {
    fontSize: 12,
    color: T.muted,
    marginTop: 6,
    lineHeight: 1.5,
  };
}

export function SectionBlock({ title, children, T }) {
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

export function Field({ label, help, T, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={labelStyle(T)}>{label}</label>
      {children}
      {help && <p style={helperStyle(T)}>{help}</p>}
    </div>
  );
}

export function HeroControls({ content, updateContent, T, isMobile = false }) {
  const [uploadingBg, setUploadingBg] = useState(false);
  const backgroundImages = Array.isArray(content.backgroundImages) ? content.backgroundImages : [];
  const allImages = content.backgroundImageUrl
    ? [content.backgroundImageUrl, ...backgroundImages.filter((u) => u !== content.backgroundImageUrl)]
    : backgroundImages;

  const handleBackgroundUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingBg(true);
    try {
      const data = await uploadImage(file, "seller");
      const next = [...backgroundImages, data.url];
      if (!content.backgroundImageUrl) {
        updateContent({ backgroundImageUrl: data.url, backgroundImages: next });
      } else {
        updateContent({ backgroundImages: next });
      }
    } catch (err) {
      alert(err.message || "Error al subir imagen");
    } finally {
      setUploadingBg(false);
      event.target.value = "";
    }
  };

  const removeImage = (index) => {
    const removed = allImages[index];
    const next = allImages.filter((_, i) => i !== index);
    const updates = { backgroundImages: next };
    if (content.backgroundImageUrl === removed) {
      updates.backgroundImageUrl = next[0] || "";
    }
    updateContent(updates);
  };

  return (
    <>
      <SectionBlock title="Diapositivas de fondo del hero" T={T}>
        <Field label="Imágenes actuales" help="Puedes subir varias fotos para que roten de fondo en el hero." T={T}>
          {allImages.length === 0 ? (
            <div style={{ color: T.muted, fontSize: 13 }}>No hay imágenes. Sube la primera foto para activar el fondo.</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(3, 1fr)", gap: 10 }}>
              {allImages.map((url, idx) => (
                <div key={url + idx} style={{ position: "relative", borderRadius: 10, overflow: "hidden", border: `1px solid ${T.border}`, aspectRatio: "16/9", background: T.inputBg }}>
                  <Image src={url} alt={`Fondo ${idx + 1}`} fill sizes="(max-width: 768px) 50vw, 150px" unoptimized style={{ objectFit: "cover" }} />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    title="Eliminar imagen"
                    style={{
                      position: "absolute",
                      top: 6,
                      right: 6,
                      width: 26,
                      height: 26,
                      borderRadius: 6,
                      background: "rgba(239, 68, 68, 0.9)",
                      color: "#fff",
                      border: "none",
                      display: "grid",
                      placeItems: "center",
                      cursor: "pointer",
                    }}
                  >
                    <i className="bi bi-trash3-fill" style={{ fontSize: 12 }} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Field>
        <Field label="Subir imagen" help={uploadingBg ? "Subiendo imagen..." : "Agrega más fotos al slideshow del hero."} T={T}>
          <input type="file" accept="image/*" onChange={handleBackgroundUpload} disabled={uploadingBg} style={{ width: "100%", padding: 12, background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, color: T.text }} />
        </Field>
        <Field label="URL de imagen principal (legacy)" help="URL del primer fondo. Se mantiene por compatibilidad." T={T}>
          <Input type="text" T={T} value={content.backgroundImageUrl || ""} onChange={(e) => updateContent({ backgroundImageUrl: e.target.value })} placeholder="https://.../mi-imagen.jpg" />
        </Field>
      </SectionBlock>
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

export function BenefitsSliderControls({ content, updateContent, updateArrayItem, addArrayItem, removeArrayItem, T, isMobile = false }) {
  const [uploadingBg, setUploadingBg] = useState(false);

  const handleBackgroundUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingBg(true);
    try {
      const data = await uploadImage(file, "seller");
      updateContent({ backgroundImageUrl: data.url });
    } catch (err) {
      alert(err.message || "Error al subir imagen");
    } finally {
      setUploadingBg(false);
      event.target.value = "";
    }
  };

  return (
    <>
      <SectionBlock title="Fondo de la franja" T={T}>
        <Field label="URL de la imagen" help="Se aplica detrás de las diapositivas de beneficios. Déjala vacía para usar el fondo normal." T={T}>
          <Input type="text" T={T} value={content.backgroundImageUrl || ""} onChange={(e) => updateContent({ backgroundImageUrl: e.target.value })} placeholder="https://.../mi-imagen.jpg" />
        </Field>
        <Field label="Subir imagen" help={uploadingBg ? "Subiendo imagen..." : "También puedes subir una imagen desde tu computador."} T={T}>
          <input type="file" accept="image/*" onChange={handleBackgroundUpload} disabled={uploadingBg} style={{ width: "100%", padding: 12, background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, color: T.text }} />
        </Field>
      </SectionBlock>
      <SectionBlock title="Diapositivas" T={T}>
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
                placeholder="Título de la diapositiva"
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
          onClick={() => addArrayItem("items", { icon: "bi-stars", title: "Nueva diapositiva", description: "Descripción de la diapositiva." })}
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
          <i className="bi bi-plus-lg"></i> Agregar diapositiva
        </button>
      </SectionBlock>
    </>
  );
}

export function SellerControls({ content, updateContent, profile, updateProfile, onPhotoUpload, uploadingPhoto, T, isMobile = false }) {
  return (
    <>
      <SectionBlock title="Perfil del vendedor" T={T}>
        <Field label="Nombre" help="Aparece en la sección y en el footer." T={T}>
          <Input type="text" T={T} value={profile?.name || ""} onChange={(e) => updateProfile({ name: e.target.value })} />
        </Field>
        <Field label="Foto" help="Puedes subirla, pegar una URL o eliminarla si te arrepientes." T={T}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ position: "relative", width: 56, height: 56, borderRadius: "50%", overflow: "hidden", border: `2px solid ${T.border}`, background: T.inputBg, flexShrink: 0 }}>
              {profile?.photo ? (
                <Image
                  src={profile.photo}
                  alt="Vendedor"
                  fill
                  sizes="56px"
                  unoptimized
                  style={{ objectFit: "cover" }}
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: T.muted }}>
                  <i className="bi bi-person" style={{ fontSize: 24 }}></i>
                </div>
              )}
            </div>
            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 16px",
                borderRadius: 10,
                background: `${T.accent}10`,
                border: `1px solid ${T.accent}40`,
                color: T.accent,
                fontWeight: 700,
                fontSize: 13,
                cursor: uploadingPhoto ? "not-allowed" : "pointer",
                opacity: uploadingPhoto ? 0.6 : 1,
              }}
            >
              <i className={`bi ${uploadingPhoto ? "bi-arrow-clockwise" : "bi-upload"}`}></i>
              {uploadingPhoto ? "Subiendo..." : "Subir foto"}
              <input type="file" accept="image/*" disabled={uploadingPhoto} onChange={onPhotoUpload} style={{ display: "none" }} />
            </label>
            {profile?.photo && (
              <button
                type="button"
                onClick={() => updateProfile({ photo: "" })}
                title="Eliminar foto"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: "10px 14px",
                  minHeight: 36,
                  borderRadius: 10,
                  background: "rgba(239, 68, 68, 0.10)",
                  border: "1px solid rgba(239, 68, 68, 0.25)",
                  color: "#EF4444",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                <i className="bi bi-trash3-fill" /> Eliminar foto
              </button>
            )}
            <Input type="text" T={T} value={profile?.photo || ""} onChange={(e) => updateProfile({ photo: e.target.value })} placeholder="O pega URL de imagen" style={{ flex: 1, minWidth: 160 }} />
          </div>
        </Field>
        <Field label="Bio" help="Texto que aparece junto a la foto." T={T}>
          <Textarea T={T} value={profile?.bio || ""} onChange={(e) => updateProfile({ bio: e.target.value })} rows={3} />
        </Field>
        <Field label="Género" help="Ajusta los pronombres (vendedor/ejecutivo)." T={T}>
          <select
            value={profile?.gender || ""}
            onChange={(e) => updateProfile({ gender: e.target.value })}
            style={{ ...inputStyle(T), cursor: "pointer" }}
          >
            <option value="">Auto-detectar</option>
            <option value="male">Masculino</option>
            <option value="female">Femenino</option>
          </select>
        </Field>
      </SectionBlock>
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
    </>
  );
}

export function PlansControls({ content, updateContent, plans, updatePlan, addPlan, removePlan, updatePlanFeature, addPlanFeature, removePlanFeature, T, isMobile = false }) {
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

      <div style={{ marginBottom: 18 }}>
        <button
          onClick={addPlan}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: 12,
            border: `1px dashed ${T.accent}`,
            background: `${T.accent}10`,
            color: T.accent,
            fontSize: 13,
            fontWeight: 800,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <i className="bi bi-plus-lg"></i> Agregar plan
        </button>
      </div>

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

function PlanCardEditor({ plan, idx, updatePlan, removePlan, updatePlanFeature, addPlanFeature, removePlanFeature, T, isMobile = false }) {
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
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm("¿Eliminar este plan? Se borrará de la base de datos.")) {
                removePlan(idx);
              }
            }}
            title="Eliminar plan"
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              border: "none",
              background: "rgba(239,68,68,0.08)",
              color: "#EF4444",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
            }}
          >
            <i className="bi bi-trash3-fill"></i>
          </button>
          <i className={`bi bi-chevron-${open ? "up" : "down"}`}></i>
        </span>
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

export function BenefitsControls({ content, updateContent, updateArrayItem, addArrayItem, removeArrayItem, T, isMobile = false }) {
  const [uploadingBg, setUploadingBg] = useState(false);

  const handleBackgroundUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingBg(true);
    try {
      const data = await uploadImage(file, "seller");
      updateContent({ backgroundImageUrl: data.url });
    } catch (err) {
      alert(err.message || "Error al subir imagen");
    } finally {
      setUploadingBg(false);
      event.target.value = "";
    }
  };

  return (
    <>
      <SectionBlock title="Imagen de fondo" T={T}>
        <Field label="URL de la imagen" help="Personaliza el fondo de la sección de beneficios. Déjala vacía para usar el color por defecto." T={T}>
          <Input type="text" T={T} value={content.backgroundImageUrl || ""} onChange={(e) => updateContent({ backgroundImageUrl: e.target.value })} placeholder="https://.../mi-imagen.jpg" />
        </Field>
        <Field label="Subir imagen" help={uploadingBg ? "Subiendo imagen..." : "También puedes subir una imagen desde tu computador."} T={T}>
          <input type="file" accept="image/*" onChange={handleBackgroundUpload} disabled={uploadingBg} style={{ width: "100%", padding: 12, background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, color: T.text }} />
        </Field>
      </SectionBlock>
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

export function CoverageControls({ content, updateContent, updateArrayItem, addArrayItem, removeArrayItem, T, isMobile = false }) {
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

export function HeaderControls({ content, updateContent, updateArrayItem, addArrayItem, removeArrayItem, T, isMobile = false }) {
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

export function MarketingControls({ profile, updateProfile, T, isMobile = false }) {
  const theme = profile?.landingTheme || "light";
  return (
    <>
      <SectionBlock title="Píxel de Meta (Facebook)" T={T}>
        <Field
          label="ID del píxel"
          help="Lo encuentras en el Administrador de eventos de Meta. Solo números. Se instala automáticamente en tu landing y registra las visitas."
          T={T}
        >
          <Input
            type="text"
            inputMode="numeric"
            T={T}
            value={profile?.metaPixelId || ""}
            onChange={(e) => updateProfile({ metaPixelId: e.target.value.replace(/\D/g, "") })}
            placeholder="Ej: 123456789012345"
          />
        </Field>
        {profile?.metaPixelId ? (
          <div
            style={{
              padding: 12,
              borderRadius: 12,
              background: "rgba(37, 211, 102, 0.10)",
              border: "1px solid rgba(37, 211, 102, 0.25)",
              color: T.muted,
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            <i className="bi bi-check-circle-fill" style={{ color: "#25D366", marginRight: 8 }}></i>
            Píxel activo: <strong style={{ color: T.text }}>{profile.metaPixelId}</strong>. Se disparará un evento PageView en cada visita.
          </div>
        ) : (
          <div
            style={{
              padding: 12,
              borderRadius: 12,
              background: `${T.accent}10`,
              border: `1px solid ${T.accent}25`,
              color: T.muted,
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            <i className="bi bi-info-circle-fill" style={{ color: T.accent, marginRight: 8 }}></i>
            Sin píxel configurado. Pega tu ID para medir tus campañas de Meta Ads.
          </div>
        )}
      </SectionBlock>
      <SectionBlock title="Apariencia de la landing" T={T}>
        <Field label="Modo de vista" help="El modo Noche es el recomendado: resalta la barra deslizante y los planes." T={T}>
          <div style={{ display: "flex", gap: 10, flexDirection: isMobile ? "column" : "row" }}>
            {[
              { id: "light", label: "Día", icon: "bi-sun-fill" },
              { id: "dark", label: "Noche", icon: "bi-moon-stars-fill" },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => updateProfile({ landingTheme: opt.id })}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: 12,
                  border: theme === opt.id ? `2px solid ${T.accent}` : `1px solid ${T.border}`,
                  background: theme === opt.id ? `${T.accent}15` : "transparent",
                  color: theme === opt.id ? T.accent : T.muted,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <i className={`bi ${opt.icon}`}></i>
                {opt.label}
              </button>
            ))}
          </div>
        </Field>
      </SectionBlock>
    </>
  );
}

export function FooterControls({ content, updateContent, updateArrayItem, addArrayItem, removeArrayItem, T, isMobile = false }) {
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
