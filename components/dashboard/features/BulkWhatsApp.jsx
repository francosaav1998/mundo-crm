"use client";
import { useMemo, useState, useEffect } from "react";
import RippleButton from "@/components/ui/RippleButton";
import SectionHeader from "@/components/dashboard/ui/SectionHeader";
import { renderTemplate } from "@/lib/dashboard/utils";
import { getWhatsAppUrl, openLink } from "@/lib/messaging";
import { STATUSES, STATUS_CONFIG } from "@/lib/dashboard/constants";

const VARS = [
  { tag: "{{nombre}}", label: "Nombre" },
  { tag: "{{telefono}}", label: "Teléfono" },
  { tag: "{{email}}", label: "Email" },
  { tag: "{{ciudad}}", label: "Ciudad" },
  { tag: "{{direccion}}", label: "Dirección" },
  { tag: "{{plan}}", label: "Plan" },
  { tag: "{{estado}}", label: "Estado" },
];

const DEFAULT_TEMPLATES = [
  {
    id: "factibilidad-confirmada",
    name: "Factibilidad confirmada",
    body: "Hola {{nombre}}, buenas noticias. Revisamos tu dirección en {{ciudad}} y confirmamos que tienes factibilidad para el plan {{plan}}. ¿Avanzamos con la solicitud?",
  },
  {
    id: "seguimiento-cierre",
    name: "Seguimiento para cerrar",
    body: "Hola {{nombre}}, te escribo para coordinar los últimos pasos de tu plan {{plan}} en {{ciudad}}. ¿Tienes alguna duda o confirmamos la instalación?",
  },
  {
    id: "cierre",
    name: "Cierre",
    body: "Hola {{nombre}}, para terminar tu solicitud del plan {{plan}} solo necesito confirmar tu dirección exacta en {{ciudad}} y coordinamos la instalación.",
  },
];

const STORAGE_KEY = "mundo-wa-templates";

const Label = ({ children, T }) => (
  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
    {children}
  </label>
);

const StatusBadge = ({ status, T }) => (
  <span style={{ fontSize: "10px", fontWeight: 800, padding: "3px 8px", borderRadius: "10px", background: STATUS_CONFIG[status]?.bg, color: STATUS_CONFIG[status]?.text, whiteSpace: "nowrap" }}>
    {status}
  </span>
);

const Avatar = ({ name, T, size = 36 }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: `${T.accent}20`, color: T.accent, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "13px", flexShrink: 0 }}>
    {name ? name.charAt(0).toUpperCase() : "?"}
  </div>
);

function getInitialWhatsAppState() {
  if (typeof window === "undefined") {
    return {
      templates: DEFAULT_TEMPLATES,
      selectedTemplateId: DEFAULT_TEMPLATES[0].id,
      bulkTemplate: DEFAULT_TEMPLATES[0].body,
    };
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return {
          templates: parsed,
          selectedTemplateId: parsed[0].id,
          bulkTemplate: parsed[0].body,
        };
      }
    }
  } catch {
    // ignore
  }
  return {
    templates: DEFAULT_TEMPLATES,
    selectedTemplateId: DEFAULT_TEMPLATES[0].id,
    bulkTemplate: DEFAULT_TEMPLATES[0].body,
  };
}

export default function BulkWhatsApp({ leads, T, isMobile, showToast, defaultMessage = "" }) {
  const initial = getInitialWhatsAppState();
  const [templates, setTemplates] = useState(initial.templates);
  const [selectedTemplateId, setSelectedTemplateId] = useState(initial.selectedTemplateId);
  const [bulkTemplate, setBulkTemplate] = useState(initial.bulkTemplate);
  const [bulkSelectedIds, setBulkSelectedIds] = useState([]);
  const [bulkStatusFilter, setBulkStatusFilter] = useState("Todos");
  const [bulkCityFilter, setBulkCityFilter] = useState("Todas");
  const [bulkSearch, setBulkSearch] = useState("");
  const [bulkPreviewId, setBulkPreviewId] = useState(null);
  const [sentIds, setSentIds] = useState([]);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [showAddTemplate, setShowAddTemplate] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  }, [templates]);

  const uniqueCities = useMemo(() => ["Todas", ...Array.from(new Set(leads.map((l) => l.city).filter(Boolean))).sort()], [leads]);
  const bulkFilteredLeads = useMemo(() => {
    const q = bulkSearch.toLowerCase();
    return leads.filter((l) => {
      const matchesStatus = bulkStatusFilter === "Todos" || l.status === bulkStatusFilter;
      const matchesCity = bulkCityFilter === "Todas" || l.city === bulkCityFilter;
      const matchesSearch = !q || [l.name, l.phone, l.city, l.plan].some((v) => String(v).toLowerCase().includes(q));
      return matchesStatus && matchesCity && matchesSearch;
    });
  }, [leads, bulkStatusFilter, bulkCityFilter, bulkSearch]);
  const selectedBulkLeads = useMemo(() => leads.filter((l) => bulkSelectedIds.includes(l.id)), [leads, bulkSelectedIds]);
  const bulkPreviewLead = useMemo(() => leads.find((l) => l.id === bulkPreviewId) || selectedBulkLeads[0] || null, [leads, bulkPreviewId, selectedBulkLeads]);

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  const handleSelectTemplate = (id) => {
    const tpl = templates.find((t) => t.id === id);
    if (!tpl) return;
    setSelectedTemplateId(id);
    setBulkTemplate(tpl.body);
  };

  const saveCurrentAsTemplate = () => {
    const name = (newTemplateName || "Plantilla personalizada").trim();
    const id = `custom-${Date.now()}`;
    const newTemplates = [...templates, { id, name, body: bulkTemplate }];
    setTemplates(newTemplates);
    setSelectedTemplateId(id);
    setNewTemplateName("");
    setShowAddTemplate(false);
    showToast(`Plantilla "${name}" guardada`);
  };

  const updateSelectedTemplate = () => {
    setTemplates((prev) => prev.map((t) => (t.id === selectedTemplateId ? { ...t, body: bulkTemplate } : t)));
    showToast("Plantilla actualizada");
  };

  const deleteTemplate = (id) => {
    const tpl = templates.find((t) => t.id === id);
    if (!tpl) return;
    if (!confirm(`¿Eliminar la plantilla "${tpl.name}"?`)) return;
    const remaining = templates.filter((t) => t.id !== id);
    setTemplates(remaining);
    const nextId = remaining[0]?.id || "";
    setSelectedTemplateId(nextId);
    setBulkTemplate(remaining[0]?.body || "");
    showToast("Plantilla eliminada");
  };

  const toggleBulkId = (id) => {
    setBulkSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const selectAllBulkFiltered = () => setBulkSelectedIds(bulkFilteredLeads.map((l) => l.id));
  const clearBulkSelection = () => {
    setBulkSelectedIds([]);
    setBulkPreviewId(null);
  };

  const sendToLead = (lead) => {
    openLink(getWhatsAppUrl(lead.phone, renderTemplate(bulkTemplate, lead)));
    setSentIds((prev) => (prev.includes(lead.id) ? prev : [...prev, lead.id]));
    showToast(`WhatsApp abierto para ${lead.name}`);
  };

  const copyBulkLinks = async () => {
    const lines = selectedBulkLeads.map((lead) => `${lead.name} (+56 ${lead.phone}): ${getWhatsAppUrl(lead.phone, renderTemplate(bulkTemplate, lead))}`);
    await navigator.clipboard.writeText(lines.join("\n"));
    showToast(`${lines.length} enlaces personalizados copiados al portapapeles`);
  };

  const inputStyle = { width: "100%", padding: "14px 16px", background: T.inputBg, border: `1px solid ${T.border}`, borderRadius: "12px", color: T.text, fontSize: "14px", outline: "none", fontFamily: "inherit" };
  const selectStyle = { padding: "10px 14px", borderRadius: "10px", background: T.inputBg, border: `1px solid ${T.border}`, color: T.text, fontSize: "13px", fontWeight: 700, outline: "none", cursor: "pointer", fontFamily: "inherit" };
  const tagBtn = { padding: "4px 10px", borderRadius: "8px", border: `1px solid ${T.accent}40`, background: `${T.accent}10`, color: T.accent, fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" };
  const actionBtn = { padding: "8px 14px", borderRadius: "10px", border: `1px solid ${T.accent}40`, background: `${T.accent}10`, color: T.accent, fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" };
  const ghostBtn = { padding: "8px 14px", borderRadius: "10px", border: `1px solid ${T.border}`, background: "transparent", color: T.muted, fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" };
  const card = { background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: "24px", padding: isMobile ? "20px" : "30px", boxShadow: "0 20px 50px rgba(0, 0, 0, 0.15)", maxWidth: "900px", margin: "0 auto" };

  return (
    <div>
      <SectionHeader
        eyebrow="WhatsApp"
        title="Mensajes masivos por WhatsApp"
        description="Escribe plantillas con variables, selecciona clientes y abre sus chats de WhatsApp con el mensaje personalizado listo para enviar."
        T={T}
        isMobile={isMobile}
      />
      <div style={card}>
        <p style={{ fontSize: "13px", color: T.muted, marginBottom: 24 }}>
          Escribe una plantilla, selecciona clientes y abre chats personalizados uno a uno.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 16 : 24, marginBottom: 24 }}>
        <div>
          <Label T={T}>Plantilla</Label>
          <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
            <select value={selectedTemplateId} onChange={(e) => handleSelectTemplate(e.target.value)} style={{ ...selectStyle, flex: 1, minWidth: 180 }}>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <RippleButton onClick={updateSelectedTemplate} style={actionBtn} title="Guardar cambios en esta plantilla">
              <i className="bi bi-save" style={{ marginRight: 4 }}></i> Guardar
            </RippleButton>
            {templates.length > 1 && (
              <RippleButton onClick={() => deleteTemplate(selectedTemplateId)} style={ghostBtn} title="Eliminar plantilla">
                <i className="bi bi-trash"></i>
              </RippleButton>
            )}
          </div>

          {showAddTemplate ? (
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <input
                type="text"
                placeholder="Nombre de la nueva plantilla"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
              />
              <RippleButton onClick={saveCurrentAsTemplate} style={actionBtn}>Crear</RippleButton>
              <RippleButton onClick={() => setShowAddTemplate(false)} style={ghostBtn}>Cancelar</RippleButton>
            </div>
          ) : (
            <RippleButton onClick={() => setShowAddTemplate(true)} style={{ ...ghostBtn, marginBottom: 12 }}>
              <i className="bi bi-plus-lg" style={{ marginRight: 4 }}></i> Agregar nueva plantilla
            </RippleButton>
          )}

          <Label T={T}>Mensaje</Label>
          <textarea rows={6} value={bulkTemplate} onChange={(e) => setBulkTemplate(e.target.value)} placeholder="Escribe el mensaje usando variables..." style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5, fontSize: "13px" }} />
          <span style={{ fontSize: "11px", color: T.muted, marginTop: 8, display: "block" }}>Las variables se reemplazan automáticamente por los datos de cada cliente.</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
            {VARS.map((v) => (
              <RippleButton key={v.tag} type="button" onClick={() => setBulkTemplate((prev) => `${prev} ${v.tag}`)} style={tagBtn}>
                <i className="bi bi-plus-lg" style={{ marginRight: 4 }}></i>
                {v.label}
              </RippleButton>
            ))}
          </div>
        </div>

        <div>
          <Label T={T}>Vista Previa (cliente de ejemplo)</Label>
          <div style={{ background: "#0B141A", border: `1px solid ${T.border}`, borderRadius: "12px", padding: "16px", minHeight: "180px", fontSize: "13px", color: "#E9EDEF", lineHeight: 1.6, fontFamily: "'Inter', sans-serif", whiteSpace: "pre-wrap" }}>
            {bulkPreviewLead ? (
              <>
                <div style={{ fontSize: "11px", color: "#8696A0", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                  <i className="bi bi-person-fill"></i> {bulkPreviewLead.name} · +56 {bulkPreviewLead.phone} · {bulkPreviewLead.city}
                </div>
                {renderTemplate(bulkTemplate, bulkPreviewLead) || <span style={{ opacity: 0.5 }}>Escribe la plantilla para ver el resultado...</span>}
              </>
            ) : (
              <span style={{ opacity: 0.5, fontStyle: "italic" }}>Selecciona clientes para previsualizar el mensaje.</span>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16, alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 240px" }}>
          <i className="bi bi-search" style={{ position: "absolute", left: 12, top: 11, color: T.muted }}></i>
          <input type="text" placeholder="Buscar nombre / teléfono / ciudad / plan..." value={bulkSearch} onChange={(e) => setBulkSearch(e.target.value)} style={{ width: "100%", padding: "10px 14px 10px 36px", borderRadius: "10px", background: T.inputBg, border: `1px solid ${T.border}`, color: T.text, fontSize: "13px", outline: "none" }} />
        </div>
        <select value={bulkStatusFilter} onChange={(e) => setBulkStatusFilter(e.target.value)} style={selectStyle}>
          <option value="Todos">Todos los estados</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select value={bulkCityFilter} onChange={(e) => setBulkCityFilter(e.target.value)} style={selectStyle}>
          {uniqueCities.map((c) => (
            <option key={c} value={c}>{c === "Todas" ? "Todas las ciudades" : c}</option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12, alignItems: "center" }}>
        <RippleButton onClick={selectAllBulkFiltered} style={actionBtn}>
          <i className="bi bi-check2-all" style={{ marginRight: 6 }}></i>
          Seleccionar filtrados ({bulkFilteredLeads.length})
        </RippleButton>
        <RippleButton onClick={clearBulkSelection} style={ghostBtn}>
          <i className="bi bi-x-lg" style={{ marginRight: 6 }}></i>
          Limpiar selección
        </RippleButton>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: "13px", fontWeight: 800, color: selectedBulkLeads.length > 0 ? T.accent : T.muted }}>
            <i className="bi bi-people-fill" style={{ marginRight: 4 }}></i>
            {selectedBulkLeads.length} seleccionados
          </span>
        </div>
      </div>

      <div style={{ border: `1px solid ${T.border}`, borderRadius: "14px", maxHeight: "420px", overflowY: "auto", marginBottom: 20 }}>
        {bulkFilteredLeads.length === 0 ? (
          <div style={{ padding: "30px", textAlign: "center", color: T.muted, fontSize: "14px" }}>
            <i className="bi bi-inbox" style={{ fontSize: 28, opacity: 0.5, display: "block", marginBottom: 8 }}></i>
            No hay clientes que coincidan con los filtros.
          </div>
        ) : (
          bulkFilteredLeads.map((lead) => {
            const checked = bulkSelectedIds.includes(lead.id);
            const sent = sentIds.includes(lead.id);
            return (
              <div
                key={lead.id}
                onClick={() => { toggleBulkId(lead.id); setBulkPreviewId(lead.id); }}
                onMouseEnter={(e) => (e.currentTarget.style.background = `${T.accent}08`)}
                onMouseLeave={(e) => (e.currentTarget.style.background = checked ? `${T.accent}10` : "transparent")}
                style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", borderBottom: `1px solid ${T.border}`, background: checked ? `${T.accent}15` : "transparent" }}
              >
                <div style={{ width: 22, height: 22, borderRadius: "6px", border: `2px solid ${checked ? T.accent : T.border}`, background: checked ? T.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#FFFFFF" }}>
                  {checked && <i className="bi bi-check-lg" style={{ fontSize: 14, fontWeight: 900 }}></i>}
                </div>
                <Avatar name={lead.name} T={T} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: T.text }}>{lead.name}</div>
                  <div style={{ fontSize: "12px", color: T.muted }}>+56 {lead.phone} · {lead.city} · {lead.plan}</div>
                </div>
                <StatusBadge status={lead.status} T={T} />
                {checked && (
                  <RippleButton
                    onClick={(e) => { e.stopPropagation(); sendToLead(lead); }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 12px",
                      borderRadius: "10px",
                      border: "none",
                      background: sent ? "#128C7E" : "#25D366",
                      color: "#fff",
                      fontSize: "12px",
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    <i className={`bi ${sent ? "bi-check-lg" : "bi-whatsapp"}`}></i>
                    {sent ? "Abierto" : "Enviar"}
                  </RippleButton>
                )}
              </div>
            );
          })
        )}
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <RippleButton
          onClick={copyBulkLinks}
          disabled={selectedBulkLeads.length === 0}
          style={{ flex: "1 1 240px", background: "transparent", color: T.accent, fontWeight: 700, padding: "16px", borderRadius: "12px", border: `1px solid ${T.accent}40`, fontSize: "14px", opacity: selectedBulkLeads.length === 0 ? 0.5 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
          <i className="bi bi-clipboard-check-fill"></i>
          Copiar {selectedBulkLeads.length} enlaces
        </RippleButton>
      </div>

      <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: "12px", background: "rgba(253, 220, 2, 0.08)", border: `1px solid ${T.secondary}30`, display: "flex", alignItems: "flex-start", gap: 10 }}>
        <i className="bi bi-info-circle-fill" style={{ color: T.secondary, fontSize: 16, marginTop: 2 }}></i>
        <span style={{ fontSize: "12px", color: T.muted, lineHeight: 1.5 }}>
          <strong style={{ color: T.text }}>Modo manual:</strong> seleccioná los clientes y pinchá &quot;Enviar&quot; en cada fila. Se abre el chat de WhatsApp con el mensaje ya cargado. WhatsApp no envía el mensaje automáticamente — vos lo confirmás en cada chat.
        </span>
        </div>
      </div>
    </div>
  );
}
