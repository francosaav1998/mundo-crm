"use client";
import { useMemo, useState } from "react";
import { renderTemplate } from "@/lib/dashboard/utils";
import { STATUSES } from "@/lib/dashboard/constants";

const VARS = [
  { tag: "{{nombre}}", label: "Nombre" },
  { tag: "{{telefono}}", label: "Teléfono" },
  { tag: "{{email}}", label: "Email" },
  { tag: "{{ciudad}}", label: "Ciudad" },
  { tag: "{{direccion}}", label: "Dirección" },
  { tag: "{{plan}}", label: "Plan" },
  { tag: "{{estado}}", label: "Estado" },
];

const TEMPLATES = {
  default: {
    subject: "Mundo · Información sobre {{plan}}",
    body: "Hola {{nombre}},\n\nGracias por tu interés en Mundo. Te escribo para ayudarte con la factibilidad del plan {{plan}} en {{ciudad}}.\n\n¿Nos coordinamos para avanzar?\n\nSaludos,\nTu ejecutivo/a Mundo",
  },
  promo: {
    subject: "🔥 Oferta especial en {{plan}}",
    body: "Hola {{nombre}},\n\nTenemos una promoción especial esta semana para el plan {{plan}}.\n\nRespóndeme y revisamos factibilidad en tu sector ({{ciudad}}).\n\n¡Saludos!\nTu ejecutivo/a Mundo",
  },
  followup: {
    subject: "Mundo · Seguimiento de tu consulta",
    body: "Hola {{nombre}},\n\nTe escribo para dar seguimiento a tu consulta sobre el plan {{plan}} en {{ciudad}}.\n\n¿Tienes alguna duda? Estoy para ayudarte.\n\nSaludos,\nTu ejecutivo/a Mundo",
  },
};

export default function BulkEmail({ leads, T, isMobile, sellerName, showToast }) {
  const [template, setTemplate] = useState("default");
  const [subject, setSubject] = useState(TEMPLATES.default.subject);
  const [body, setBody] = useState(TEMPLATES.default.body);
  const [selectedIds, setSelectedIds] = useState([]);
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [cityFilter, setCityFilter] = useState("Todas");
  const [search, setSearch] = useState("");
  const [sending, setSending] = useState(false);
  const [useSmtp, setUseSmtp] = useState(false);

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

  const applyTemplate = (key) => {
    setTemplate(key);
    setSubject(TEMPLATES[key].subject);
    setBody(TEMPLATES[key].body);
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

  const send = async () => {
    if (selectedLeads.length === 0) return;

    if (useSmtp) {
      if (!confirm(`Vas a enviar ${selectedLeads.length} correos reales por SMTP. ¿Continuar?`)) return;
      setSending(true);
      let ok = 0;
      let fail = 0;
      for (const lead of selectedLeads) {
        const subj = renderTemplate(subject, lead);
        const txt = renderTemplate(body, lead) + `\n\n— ${sellerName}`;
        try {
          const res = await fetch("/api/email/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: lead.email,
              subject: subj,
              body: txt,
              fromName: sellerName,
            }),
          });
          if (res.ok) ok++;
          else fail++;
        } catch {
          fail++;
        }
      }
      setSending(false);
      showToast(`${ok} correos enviados${fail ? `, ${fail} fallidos` : ""}`);
      return;
    }

    if (!confirm(`Vas a abrir ${selectedLeads.length} correos en tu cliente. ¿Continuar?`)) return;
    for (const lead of selectedLeads) {
      const subj = renderTemplate(subject, lead);
      const txt = renderTemplate(body, lead) + `\n\n— ${sellerName}`;
      window.open(
        `mailto:${lead.email}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(txt)}`,
        "_blank"
      );
      await new Promise((r) => setTimeout(r, 400));
    }
    showToast(`${selectedLeads.length} correos preparados`);
  };

  const cardStyle = {
    background: T.bgCard,
    border: `1px solid ${T.border}`,
    borderRadius: "24px",
    padding: isMobile ? "20px" : "30px",
    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.3)",
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
    color: active ? T.bg : T.muted,
  });

  return (
    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 360px", gap: isMobile ? 16 : 24 }}>
      <div style={cardStyle}>
        <h2 style={{ fontSize: "20px", fontWeight: 800, color: T.accent, marginBottom: 6 }}>
          <i className="bi bi-envelope-fill" style={{ marginRight: 8 }} /> Mensajes por Correo
        </h2>
        <p style={{ fontSize: "13px", color: T.muted, marginBottom: 24 }}>
          Selecciona leads con email y envía mensajes personalizados por SMTP o tu cliente de correo.
        </p>

        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Plantilla</label>
          <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
            {[
              { key: "default", label: "Estándar" },
              { key: "promo", label: "Promo" },
              { key: "followup", label: "Seguimiento" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => applyTemplate(t.key)}
                style={btnActive(template === t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>
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

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
            marginBottom: 14,
            padding: "10px 12px",
            borderRadius: "10px",
            background: T.inputBg,
            border: `1px solid ${T.border}`,
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>Modo envío:</span>
          <button onClick={() => setUseSmtp(false)} style={btnActive(!useSmtp)}>
            Mailto
          </button>
          <button onClick={() => setUseSmtp(true)} style={btnActive(useSmtp)}>
            SMTP corporativo
          </button>
        </div>

        {useSmtp && (
          <div
            style={{
              marginBottom: 18,
              padding: 16,
              borderRadius: "12px",
              background: T.inputBg,
              border: `1px solid ${T.border}`,
            }}
          >
            <p style={{ fontSize: 12, color: T.muted, lineHeight: 1.5 }}>
              El SMTP se configura de forma segura en las variables de entorno del servidor.
              Si no está configurado, el envío fallará y podrás usar el modo Mailto.
            </p>
          </div>
        )}

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={send}
            disabled={sending || selectedLeads.length === 0}
            style={{
              padding: "10px 20px",
              borderRadius: "10px",
              border: "none",
              cursor: sending || selectedLeads.length === 0 ? "not-allowed" : "pointer",
              background: sending || selectedLeads.length === 0 ? "rgba(255,255,255,0.06)" : T.accent,
              color: sending || selectedLeads.length === 0 ? T.muted : T.bg,
              fontWeight: 800,
              fontSize: 13,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              boxShadow: sending || selectedLeads.length === 0 ? "none" : T.glowCyan,
            }}
          >
            <i className="bi bi-send-fill" /> {sending ? "Enviando..." : `Enviar a ${selectedLeads.length}`}
          </button>
          <button
            onClick={copyList}
            disabled={selectedLeads.length === 0}
            style={{
              padding: "10px 20px",
              borderRadius: "10px",
              border: `1px solid ${T.border}`,
              background: "transparent",
              color: T.text,
              fontWeight: 700,
              fontSize: 13,
              cursor: selectedLeads.length === 0 ? "not-allowed" : "pointer",
            }}
          >
            Copiar lista
          </button>
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
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={inputStyle}
          />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ flex: 1, minWidth: 100, ...inputStyle, padding: "7px 10px" }}
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
              style={{ flex: 1, minWidth: 100, ...inputStyle, padding: "7px 10px" }}
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

        <div style={{ maxHeight: 450, overflowY: "auto", border: `1px solid ${T.border}`, borderRadius: "12px" }}>
          {filteredLeads.length === 0 ? (
            <div style={{ padding: "30px 0", textAlign: "center", color: T.muted }}>
              <i className="bi bi-inbox" style={{ fontSize: 28, opacity: 0.5 }} />
              <p style={{ marginTop: 10, fontSize: 12, fontWeight: 700 }}>No hay leads con email.</p>
            </div>
          ) : (
            filteredLeads.map((lead) => {
              const checked = selectedIds.includes(lead.id);
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
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    readOnly
                    style={{ accentColor: T.accent, width: 16, height: 16 }}
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
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: T.muted }}>{lead.city}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
