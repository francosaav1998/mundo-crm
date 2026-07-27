"use client";

import { useState } from "react";
import { Input, Textarea, Field, SectionBlock } from "./LandingControls";

function ImageUploadField({ value, onChange, T, label = "Subir imagen" }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "b2b");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al subir imagen");
      onChange(data.url);
    } catch (err) {
      alert(err.message || "Error al subir imagen");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <Field label={label} help={uploading ? "Subiendo imagen..." : "Sube una imagen desde tu computador."} T={T}>
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
        style={{ width: "100%", padding: 12, background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, color: T.text }}
      />
    </Field>
  );
}

export function B2BHeaderControls({ content, updateSection, T }) {
  const updateNavLink = (idx, updates) => {
    const navLinks = [...(content.navLinks || [])];
    navLinks[idx] = { ...navLinks[idx], ...updates };
    updateSection({ navLinks });
  };
  const removeNavLink = (idx) => {
    const navLinks = [...(content.navLinks || [])];
    navLinks.splice(idx, 1);
    updateSection({ navLinks });
  };
  const addNavLink = () => {
    updateSection({ navLinks: [...(content.navLinks || []), { id: "seccion", label: "Nuevo link" }] });
  };

  return (
    <>
      <SectionBlock title="Marca" T={T}>
        <Field label="Nombre de la marca" T={T}>
          <Input type="text" T={T} value={content.brandName || ""} onChange={(e) => updateSection({ brandName: e.target.value })} />
        </Field>
        <Field label="Subtítulo de la marca" T={T}>
          <Input type="text" T={T} value={content.brandTag || ""} onChange={(e) => updateSection({ brandTag: e.target.value })} />
        </Field>
        <Field label="Texto del botón de ingreso" T={T}>
          <Input type="text" T={T} value={content.loginLabel || ""} onChange={(e) => updateSection({ loginLabel: e.target.value })} />
        </Field>
      </SectionBlock>
      <SectionBlock title="Links de navegación" T={T}>
        {(content.navLinks || []).map((link, idx) => (
          <div key={idx} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <Input type="text" T={T} value={link.id} onChange={(e) => updateNavLink(idx, { id: e.target.value })} style={{ flex: 1 }} placeholder="ID sección" />
            <Input type="text" T={T} value={link.label} onChange={(e) => updateNavLink(idx, { label: e.target.value })} style={{ flex: 2 }} placeholder="Texto visible" />
            <button
              onClick={() => removeNavLink(idx)}
              style={{ width: 44, borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)", color: "#EF4444", cursor: "pointer", fontSize: 16 }}
            >
              <i className="bi bi-trash3-fill"></i>
            </button>
          </div>
        ))}
        <button
          onClick={addNavLink}
          style={{ padding: "10px 16px", borderRadius: 10, fontSize: 13, fontWeight: 700, color: T.accent, background: `${T.accent}10`, border: `1px solid ${T.accent}30`, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          <i className="bi bi-plus-lg"></i> Agregar link
        </button>
      </SectionBlock>
    </>
  );
}

export function B2BHeroControls({ content, updateSection, T, isMobile }) {
  const updateProof = (idx, value) => {
    const proofs = [...(content.proofs || [])];
    proofs[idx] = value;
    updateSection({ proofs });
  };

  return (
    <>
      <SectionBlock title="Textos principales" T={T}>
        <Field label="Eyebrow (texto pequeño superior)" T={T}>
          <Input type="text" T={T} value={content.eyebrow || ""} onChange={(e) => updateSection({ eyebrow: e.target.value })} />
        </Field>
        <Field label="Título (línea 1)" T={T}>
          <Input type="text" T={T} value={content.title || ""} onChange={(e) => updateSection({ title: e.target.value })} />
        </Field>
        <Field label="Título destacado (línea 2, en color)" T={T}>
          <Input type="text" T={T} value={content.titleHighlight || ""} onChange={(e) => updateSection({ titleHighlight: e.target.value })} />
        </Field>
        <Field label="Descripción" T={T}>
          <Textarea T={T} rows={3} value={content.description || ""} onChange={(e) => updateSection({ description: e.target.value })} />
        </Field>
      </SectionBlock>
      <SectionBlock title="Botones y pruebas" T={T}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
          <Field label="Botón primario" T={T}>
            <Input type="text" T={T} value={content.ctaPrimary || ""} onChange={(e) => updateSection({ ctaPrimary: e.target.value })} />
          </Field>
          <Field label="Botón secundario" T={T}>
            <Input type="text" T={T} value={content.ctaSecondary || ""} onChange={(e) => updateSection({ ctaSecondary: e.target.value })} />
          </Field>
        </div>
        <Field label="Pruebas de confianza" help="Aparecen con un ● debajo de los botones." T={T}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(content.proofs || []).map((proof, idx) => (
              <Input key={idx} type="text" T={T} value={proof} onChange={(e) => updateProof(idx, e.target.value)} />
            ))}
          </div>
        </Field>
      </SectionBlock>
      <SectionBlock title="Imagen del hero" T={T}>
        <Field label="URL de la imagen" T={T}>
          <Input type="text" T={T} value={content.imageUrl || ""} onChange={(e) => updateSection({ imageUrl: e.target.value })} placeholder="https://.../imagen.jpg" />
        </Field>
        <ImageUploadField value={content.imageUrl} onChange={(url) => updateSection({ imageUrl: url })} T={T} />
        <Field label="Texto alternativo (accesibilidad)" T={T}>
          <Input type="text" T={T} value={content.imageAlt || ""} onChange={(e) => updateSection({ imageAlt: e.target.value })} />
        </Field>
      </SectionBlock>
      <SectionBlock title="Tarjeta de métrica" T={T}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
          <Field label="Etiqueta" T={T}>
            <Input type="text" T={T} value={content.metricLabel || ""} onChange={(e) => updateSection({ metricLabel: e.target.value })} />
          </Field>
          <Field label="Tag (ej: EN VIVO)" T={T}>
            <Input type="text" T={T} value={content.metricTag || ""} onChange={(e) => updateSection({ metricTag: e.target.value })} />
          </Field>
        </div>
        <Field label="Valor principal" T={T}>
          <Input type="text" T={T} value={content.metricValue || ""} onChange={(e) => updateSection({ metricValue: e.target.value })} />
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
          <Field label="Crecimiento" T={T}>
            <Input type="text" T={T} value={content.metricGrowth || ""} onChange={(e) => updateSection({ metricGrowth: e.target.value })} />
          </Field>
          <Field label="Período" T={T}>
            <Input type="text" T={T} value={content.metricPeriod || ""} onChange={(e) => updateSection({ metricPeriod: e.target.value })} />
          </Field>
        </div>
      </SectionBlock>
      <SectionBlock title="Tarjeta de prospecto" T={T}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
          <Field label="Etiqueta" T={T}>
            <Input type="text" T={T} value={content.leadLabel || ""} onChange={(e) => updateSection({ leadLabel: e.target.value })} />
          </Field>
          <Field label="Nombre" T={T}>
            <Input type="text" T={T} value={content.leadName || ""} onChange={(e) => updateSection({ leadName: e.target.value })} />
          </Field>
        </div>
      </SectionBlock>
    </>
  );
}

export function B2BCompaniesControls({ content, updateSection, T }) {
  return (
    <SectionBlock title="Barra deslizante de compañías" T={T}>
      <Field label="Eyebrow" T={T}>
        <Input type="text" T={T} value={content.eyebrow || ""} onChange={(e) => updateSection({ eyebrow: e.target.value })} />
      </Field>
      <Field label="Título" T={T}>
        <Input type="text" T={T} value={content.title || ""} onChange={(e) => updateSection({ title: e.target.value })} />
      </Field>
      <p style={{ fontSize: 12, color: T.muted, lineHeight: 1.5 }}>
        <i className="bi bi-info-circle-fill" style={{ color: T.accent, marginRight: 6 }}></i>
        Los logos de las compañías se gestionan como recursos de marca y no son editables desde aquí.
      </p>
    </SectionBlock>
  );
}

export function B2BBenefitsControls({ content, updateSection, T, isMobile }) {
  const updateItem = (idx, updates) => {
    const items = [...(content.items || [])];
    items[idx] = { ...items[idx], ...updates };
    updateSection({ items });
  };
  const removeItem = (idx) => {
    const items = [...(content.items || [])];
    items.splice(idx, 1);
    updateSection({ items });
  };
  const addItem = () => {
    updateSection({ items: [...(content.items || []), { icon: "bi-stars", title: "Nuevo beneficio", description: "Descripción del beneficio." }] });
  };

  return (
    <>
      <SectionBlock title="Encabezado" T={T}>
        <Field label="Eyebrow" T={T}>
          <Input type="text" T={T} value={content.eyebrow || ""} onChange={(e) => updateSection({ eyebrow: e.target.value })} />
        </Field>
        <Field label="Título (línea 1)" T={T}>
          <Input type="text" T={T} value={content.title || ""} onChange={(e) => updateSection({ title: e.target.value })} />
        </Field>
        <Field label="Título (línea 2)" T={T}>
          <Input type="text" T={T} value={content.titleHighlight || ""} onChange={(e) => updateSection({ titleHighlight: e.target.value })} />
        </Field>
      </SectionBlock>
      <SectionBlock title="Tarjetas de beneficios" T={T}>
        {(content.items || []).map((item, idx) => (
          <div key={idx} style={{ marginBottom: 14, padding: 16, borderRadius: 14, background: T.bgCard, border: `1px solid ${T.border}` }}>
            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 12, marginBottom: 10 }}>
              <Input type="text" T={T} value={item.icon} onChange={(e) => updateItem(idx, { icon: e.target.value })} style={{ width: isMobile ? "100%" : 120 }} placeholder="bi-stars" />
              <Input type="text" T={T} value={item.title} onChange={(e) => updateItem(idx, { title: e.target.value })} style={{ flex: 1 }} placeholder="Título del beneficio" />
            </div>
            <Textarea T={T} rows={2} value={item.description} onChange={(e) => updateItem(idx, { description: e.target.value })} style={{ minHeight: 60 }} placeholder="Descripción" />
            <button
              onClick={() => removeItem(idx)}
              style={{ marginTop: 10, padding: "8px 12px", borderRadius: 8, fontSize: 12, color: "#EF4444", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)", cursor: "pointer", fontWeight: 700 }}
            >
              <i className="bi bi-trash3-fill"></i> Eliminar
            </button>
          </div>
        ))}
        <button
          onClick={addItem}
          style={{ padding: "10px 16px", borderRadius: 10, fontSize: 13, fontWeight: 700, color: T.accent, background: `${T.accent}10`, border: `1px solid ${T.accent}30`, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          <i className="bi bi-plus-lg"></i> Agregar beneficio
        </button>
      </SectionBlock>
    </>
  );
}

export function B2BCtaControls({ content, updateSection, T }) {
  return (
    <SectionBlock title="Sección final (llamado a la acción)" T={T}>
      <Field label="Eyebrow" T={T}>
        <Input type="text" T={T} value={content.eyebrow || ""} onChange={(e) => updateSection({ eyebrow: e.target.value })} />
      </Field>
      <Field label="Título (línea 1)" T={T}>
        <Input type="text" T={T} value={content.title || ""} onChange={(e) => updateSection({ title: e.target.value })} />
      </Field>
      <Field label="Título (línea 2)" T={T}>
        <Input type="text" T={T} value={content.titleHighlight || ""} onChange={(e) => updateSection({ titleHighlight: e.target.value })} />
      </Field>
      <Field label="Texto del botón" T={T}>
        <Input type="text" T={T} value={content.buttonLabel || ""} onChange={(e) => updateSection({ buttonLabel: e.target.value })} />
      </Field>
    </SectionBlock>
  );
}

export function B2BFooterControls({ content, updateSection, T }) {
  return (
    <SectionBlock title="Footer" T={T}>
      <Field label="Descripción" T={T}>
        <Textarea T={T} rows={2} value={content.tagline || ""} onChange={(e) => updateSection({ tagline: e.target.value })} />
      </Field>
      <Field label="Copyright" T={T}>
        <Input type="text" T={T} value={content.copyright || ""} onChange={(e) => updateSection({ copyright: e.target.value })} />
      </Field>
    </SectionBlock>
  );
}
