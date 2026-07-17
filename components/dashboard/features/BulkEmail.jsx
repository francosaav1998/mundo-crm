"use client";
import { useMemo, useState, useEffect } from "react";
import { renderTemplate } from "@/lib/dashboard/utils";
import { STATUSES } from "@/lib/dashboard/constants";
import {
  getGmailComposeUrl,
  getOutlookComposeUrl,
  openLink,
} from "@/lib/messaging";

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
    id: "primera-respuesta",
    name: "Primera respuesta",
    subject: "Mundo · Información sobre {{plan}}",
    body: "Hola {{nombre}},\n\nGracias por tu interés en Mundo. Te escribo para ayudarte con la factibilidad del plan {{plan}} en {{ciudad}}.\n\n¿Nos coordinamos para avanzar?\n\nSaludos,",
  },
  {
    id: "seguimiento",
    name: "Seguimiento",
    subject: "Mundo · Seguimiento de tu consulta",
    body: "Hola {{nombre}},\n\nTe escribo para dar seguimiento a tu consulta sobre el plan {{plan}} en {{ciudad}}.\n\n¿Tienes alguna duda? Estoy para ayudarte.\n\nSaludos,",
  },
  {
    id: "cierre",
    name: "Cierre",
    subject: "Mundo · Confirmemos tu solicitud",
    body: "Hola {{nombre}},\n\nYa casi estamos. ¿Confirmamos tu solicitud del plan {{plan}} para {{ciudad}}?\n\nSolo necesito tu dirección exacta y coordinamos la instalación.\n\nSaludos,",
  },
];

const STORAGE_KEY = "mundo-email-templates";

function getInitialEmailState() {
  if (typeof window === "undefined") {
    return {
      templates: DEFAULT_TEMPLATES,
      selectedTemplateId: DEFAULT_TEMPLATES[0].id,
      subject: DEFAULT_TEMPLATES[0].subject,
      body: DEFAULT_TEMPLATES[0].body,
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
          subject: parsed[0].subject,
          body: parsed[0].body,
        };
      }
    }
  } catch {
    // ignore
  }
  return {
    templates: DEFAULT_TEMPLATES,
    selectedTemplateId: DEFAULT_TEMPLATES[0].id,
    subject: DEFAULT_TEMPLATES[0].subject,
    body: DEFAULT_TEMPLATES[0].body,
  };
}

export default function BulkEmail({ leads, T, isMobile, sellerName, showToast }) {
  const initial = getInitialEmailState();
  const [templates, setTemplates] = useState(initial.templates);
  const [selectedTemplateId, setSelectedTemplateId] = useState(initial.selectedTemplateId);
  const [subject, setSubject] = useState(initial.subject);
  const [body, setBody] = useState(initial.body);
  const [selectedIds, setSelectedIds] = useState([]);
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [cityFilter, setCityFilter] = useState("Todas");
  const [search, setSearch] = useState("");
  const [sentIds, setSentIds] = useState([]);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [showAddTemplate, setShowAddTemplate] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  }, [templates]);

  const cities = useMemo(
    () => Array.from(new Set(leads.map((l) => l.city).filter(Boolean))).sort(),
    [leads]
  );

  const filteredLeads = useMemo(() => {
    const q = search.toLowerCase();
    return leads.filter((l) => {
      const hasEmail = l.email && l.email.includes("@");
      const matchesStatus = statusFilter === "Todos" || l.status === statusFilter;
      const matchesCity = cityFilter === "Todas" || l.city === cityFilter;
      const matchesSearch =
        !q ||
        l.name?.toLowerCase().includes(q) ||
        l.email?.toLowerCase().includes(q) ||
        l.city?.toLowerCase().includes(q) ||
        l.plan?.toLowerCase().includes(q);
      return hasEmail && matchesStatus && matchesCity && matchesSearch;
    });
  }, [leads, search, statusFilter, cityFilter]);

  const selectedLeads = useMemo(
    () => leads.filter((l) => selectedIds.includes(l.id)),
    [leads, selectedIds]
  );

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  const handleSelectTemplate = (id) => {
    const tpl = templates.find((t) => t.id === id);
    if (!tpl) return;
    setSelectedTemplateId(id);
    setSubject(tpl.subject);
    setBody(tpl.body);
  };

  const saveCurrentAsTemplate = () => {
    const name = (newTemplateName || "Plantilla personalizada").trim();
    const id = `custom-${Date.now()}`;
    const newTemplates = [...templates, { id, name, subject, body }];
    setTemplates(newTemplates);
    setSelectedTemplateId(id);
    setNewTemplateName("");
    setShowAddTemplate(false);
    showToast(`Plantilla "${name}" guardada`);
  };

  const updateSelectedTemplate = () => {
    setTemplates((prev) => prev.map((t) => (t.id === selectedTemplateId ? { ...t, subject, body } : t)));
    showToast("Plantilla actualizada");
  };

  const deleteTemplate = (id) => {
    const tpl = templates.find((t) => t.id === id);
    if (!tpl) return;
    if (!confirm(`¿Eliminar la plantilla "${tpl.name}"?`)) return;
    const remaining = templates.filter((t) => t.id !== id);
    setTemplates(remaining);
    const next = remaining[0];
    setSelectedTemplateId(next?.id || "");
    setSubject(next?.subject || "");
    setBody(next?.body || "");
    showToast("Plantilla eliminada");
  };

  const toggleId = (id) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const selectAllFiltered = () => setSelectedIds(filteredLeads.map((l) => l.id));
  const clearSelection = () => setSelectedIds([]);

  const copyList = () => {
    const emails = selectedLeads.map((l) => l.email).filter(Boolean).join(", ");
    navigator.clipboard.writeText(emails);
    showToast("Lista de correos copiada");
  };

  const markSent = (id) => {
    setSentIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const getRendered = (lead) => ({
    subject: renderTemplate(subject, lead),
    body: renderTemplate(body, lead) + `\n\n— ${sellerName || "Tu ejecutivo/a Mundo"}`,
  });

  const openGmail = (lead) => {
    const { subject: subj, body: txt } = getRendered(lead);
    openLink(getGmailComposeUrl(lead.email, subj, txt));
    markSent(lead.id);
    showToast(`Gmail abierto para ${lead.name}`);
  };

  const openOutlook = (lead) => {
    const { subject: subj, body: txt } = getRendered(lead);
    openLink(getOutlookComposeUrl(lead.email, subj, txt));
    markSent(lead.id);
    showToast(`Outlook abierto para ${lead.name}`);
  };

  const cardStyle = {
    background: T.bgCard,
    border: `1px solid ${T.border}`,
    borderRadius: "24px",
    padding: isMobile ? "20px" : "30px",
    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.2)",
    backdropFilter: "blur(20px)",
  };

  const labelStyle = {
    fontSize: "11px",
    fontWeight: 700,
    color: T.muted,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };

  const inputStyle = {
    width: "100%",
    marginTop: 8,
    padding: "10px 14px",
    borderRadius: "10px",
    background: T.inputBg,
    border: `1px solid ${T.border}`,
    color: T.text,
    fontSize: 13,
    outline: "none",
  };

  const btnBase = {
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
  };

  const tagBtn = {
    padding: "4px 10px",
    borderRadius: "8px",
    border: `1px solid ${T.accent}40`,
    background: `${T.accent}10`,
    color: T.accent,
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
  };

  const btnActive = (active, color = T.accent) => ({
    ...btnBase,
    border: `1px solid ${active ? color : T.border}`,
    background: active ? color : "transparent",
    color: active ? "#FFFFFF" : T.muted,
  });

  const emailClientBtn = (color) => ({
    ...btnBase,
    border: "none",
    background: color,
    color: "#fff",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  });

  return (
    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 420px", gap: isMobile ? 16 : 24 }}>
      <div style={cardStyle}>
        <p style={{ fontSize: "13px", color: T.muted, marginBottom: 24 }}>
          Selecciona leads con email y abre un correo personalizado uno a uno en Gmail, Outlook o tu cliente de correo.
        </p>

        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Plantilla</label>
          <div style={{ display: "flex", gap: 8, marginTop: 8, marginBottom: 10, flexWrap: "wrap" }}>
            <select value={selectedTemplateId} onChange={(e) => handleSelectTemplate(e.target.value)} style={{ ...inputStyle, flex: 1, minWidth: 180, marginTop: 0 }}>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <button onClick={updateSelectedTemplate} style={btnActive(false, T.accent)} title="Guardar cambios en esta plantilla">
              <i className="bi bi-save" style={{ marginRight: 4 }}></i> Guardar
            </button>
            {templates.length > 1 && (
              <button onClick={() => deleteTemplate(selectedTemplateId)} style={btnActive(false)} title="Eliminar plantilla">
                <i className="bi bi-trash"></i>
              </button>
            )}
          </div>

          {showAddTemplate ? (
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <input
                type="text"
                placeholder="Nombre de la nueva plantilla"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                style={{ ...inputStyle, flex: 1, marginTop: 0 }}
              />
              <button onClick={saveCurrentAsTemplate} style={btnActive(false, T.accent)}>Crear</button>
              <button onClick={() => setShowAddTemplate(false)} style={btnActive(false)}>Cancelar</button>
            </div>
          ) : (
            <button onClick={() => setShowAddTemplate(true)} style={{ ...btnActive(false), marginBottom: 12 }}>
              <i className="bi bi-plus-lg" style={{ marginRight: 4 }}></i> Agregar nueva plantilla
            </button>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Asunto</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Cuerpo</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={7}
            style={{
              ...inputStyle,
              padding: "12px 14px",
              fontFamily: "inherit",
              resize: "vertical",
            }}
          />
          <div style={{ fontSize: "11px", color: T.muted, marginTop: 6 }}>
            Haz clic para insertar variables en el cuerpo:
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
            {VARS.map((v) => (
              <button
                key={v.tag}
                type="button"
                onClick={() => setBody((prev) => `${prev} ${v.tag}`)}
                style={tagBtn}
              >
                <i className="bi bi-plus-lg" style={{ marginRight: 4 }}></i>
                {v.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: "12px", background: "rgba(253, 220, 2, 0.08)", border: `1px solid ${T.secondary}30`, display: "flex", alignItems: "flex-start", gap: 10 }}>
          <i className="bi bi-info-circle-fill" style={{ color: T.secondary, fontSize: 16, marginTop: 2 }}></i>
          <span style={{ fontSize: "12px", color: T.muted, lineHeight: 1.5 }}>
            <strong style={{ color: T.text }}>Modo manual:</strong> seleccioná los leads y pinchá Gmail o Outlook en cada fila. Se abre el correo con el asunto y cuerpo ya cargados. El envío real lo confirmás vos en cada cliente.
          </span>
        </div>
      </div>

      <div
        style={{
          ...cardStyle,
          padding: isMobile ? "20px" : "24px",
          height: "fit-content",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: T.accent }}>
            <i className="bi bi-people-fill" style={{ marginRight: 6 }} /> Destinatarios
          </h3>
          <span style={{ fontSize: 12, color: T.muted, fontWeight: 700 }}>
            {selectedIds.length}/{filteredLeads.length}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
          <input
            type="text"
            placeholder="Buscar nombre / email / ciudad / plan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...inputStyle, marginTop: 0 }}
          />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ flex: 1, minWidth: 100, ...inputStyle, padding: "7px 10px", marginTop: 0 }}
            >
              <option value="Todos">Todos los estados</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              style={{ flex: 1, minWidth: 100, ...inputStyle, padding: "7px 10px", marginTop: 0 }}
            >
              <option value="Todas">Todas las ciudades</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={selectAllFiltered} style={{ flex: 1, ...btnActive(false, T.accent) }}>
              Todos
            </button>
            <button onClick={clearSelection} style={{ flex: 1, ...btnActive(false, T.accent) }}>
              Limpiar
            </button>
          </div>
        </div>

        <div style={{ maxHeight: 520, overflowY: "auto", border: `1px solid ${T.border}`, borderRadius: "12px" }}>
          {filteredLeads.length === 0 ? (
            <div style={{ padding: "30px 0", textAlign: "center", color: T.muted }}>
              <i className="bi bi-inbox" style={{ fontSize: 28, opacity: 0.5 }} />
              <p style={{ marginTop: 10, fontSize: 12, fontWeight: 700 }}>No hay leads con email.</p>
            </div>
          ) : (
            filteredLeads.map((lead) => {
              const checked = selectedIds.includes(lead.id);
              const sent = sentIds.includes(lead.id);
              return (
                <div
                  key={lead.id}
                  onClick={() => toggleId(lead.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    borderBottom: `1px solid ${T.border}`,
                    background: checked ? `${T.accent}10` : "transparent",
                    cursor: "pointer",
                    flexWrap: "wrap",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    readOnly
                    style={{ accentColor: T.accent, width: 16, height: 16, flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{lead.name}</div>
                    <div
                      style={{
                        fontSize: 11,
                        color: T.muted,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {lead.email}
                    </div>
                    <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>{lead.city} · {lead.plan}</div>
                  </div>
                  {checked && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }} onClick={(e) => e.stopPropagation()}>
                      {sent && (
                        <span title="Abierto" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 800, color: "#25D366" }}>
                          <i className="bi bi-check-circle-fill"></i>
                        </span>
                      )}
                      <button onClick={() => openGmail(lead)} style={emailClientBtn("#EA4335")} title="Abrir en Gmail">
                        <i className="bi bi-google"></i> Gmail
                      </button>
                      <button onClick={() => openOutlook(lead)} style={emailClientBtn("#0078D4")} title="Abrir en Outlook">
                        <i className="bi bi-microsoft"></i> Outlook
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
