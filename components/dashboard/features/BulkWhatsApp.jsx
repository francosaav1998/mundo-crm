"use client";
import { useMemo, useState } from "react";
import { renderTemplate, getWhatsAppUrl } from "@/lib/dashboard/utils";
import { STATUSES, STATUS_CONFIG } from "@/lib/dashboard/constants";

const DEFAULT_GREETING = "vi tu página web y me gustaría recibir asesoría sobre los planes de Internet y TV Hogar de Mundo.";
const DEFAULT_TEMPLATE = "Hola {{nombre}}, soy tu ejecutiva Mundo. Te escribo por tu consulta sobre el plan {{plan}} para {{ciudad}}. ¿Avanzamos con la factibilidad? Responde y lo gestiono.";
const VARS = [
  { tag: "{{nombre}}", label: "Nombre" },
  { tag: "{{telefono}}", label: "Teléfono" },
  { tag: "{{ciudad}}", label: "Ciudad" },
  { tag: "{{direccion}}", label: "Dirección" },
  { tag: "{{plan}}", label: "Plan" },
  { tag: "{{estado}}", label: "Estado" },
];

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

export default function BulkWhatsApp({ leads, T, isMobile, showToast }) {
  const [waMode, setWaMode] = useState("single");
  const [clientSelectorOpen, setClientSelectorOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [clientSearch, setClientSearch] = useState("");
  const [whatsappMsg, setWhatsappMsg] = useState("");
  const [bulkTemplate, setBulkTemplate] = useState(DEFAULT_TEMPLATE);
  const [bulkSelectedIds, setBulkSelectedIds] = useState([]);
  const [bulkStatusFilter, setBulkStatusFilter] = useState("Todos");
  const [bulkCityFilter, setBulkCityFilter] = useState("Todas");
  const [bulkSearch, setBulkSearch] = useState("");
  const [bulkPreviewId, setBulkPreviewId] = useState(null);
  const [bulkSending, setBulkSending] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ sent: 0, total: 0, current: null });
  const [bulkDelay, setBulkDelay] = useState(800);

  const selectedLead = leads.find((l) => l.id === selectedClientId) || null;
  const filteredLeadsForSelector = useMemo(() => {
    const q = clientSearch.toLowerCase();
    return leads.filter((l) => l.name.toLowerCase().includes(q) || l.phone.includes(q) || l.city.toLowerCase().includes(q)).slice(0, 50);
  }, [leads, clientSearch]);
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

  const selectClient = (lead) => {
    setSelectedClientId(lead.id);
    setClientSelectorOpen(false);
    setClientSearch("");
    const greeting = DEFAULT_GREETING;
    setWhatsappMsg(`Hola ${lead.name}, ${greeting.toLowerCase().startsWith("hola") ? greeting.slice(4).trim() : greeting}`);
  };

  const sendCustomWhatsApp = () => {
    if (!selectedLead || !whatsappMsg.trim()) return;
    window.open(getWhatsAppUrl(selectedLead.phone, whatsappMsg), "_blank");
    showToast(`WhatsApp enviado a ${selectedLead.name}`);
  };

  const toggleBulkId = (id) => {
    setBulkSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const selectAllBulkFiltered = () => setBulkSelectedIds(bulkFilteredLeads.map((l) => l.id));
  const clearBulkSelection = () => {
    setBulkSelectedIds([]);
    setBulkPreviewId(null);
  };

  const sendBulkWhatsApp = async () => {
    if (selectedBulkLeads.length === 0) return;
    const confirm = window.confirm(`Vas a abrir ${selectedBulkLeads.length} conversaciones de WhatsApp personalizadas. Asegúrate de permitir pop-ups para este sitio. ¿Continuar?`);
    if (!confirm) return;
    setBulkSending(true);
    setBulkProgress({ sent: 0, total: selectedBulkLeads.length, current: null });
    let sent = 0;
    for (const lead of selectedBulkLeads) {
      setBulkProgress({ sent, total: selectedBulkLeads.length, current: lead });
      window.open(getWhatsAppUrl(lead.phone, renderTemplate(bulkTemplate, lead)), "_blank");
      sent += 1;
      setBulkProgress({ sent, total: selectedBulkLeads.length, current: lead });
      await new Promise((r) => setTimeout(r, bulkDelay));
    }
    setBulkProgress({ sent, total: selectedBulkLeads.length, current: null });
    setBulkSending(false);
    showToast(`${sent} mensajes WhatsApp preparados en pestañas individuales`);
  };

  const copyBulkLinks = async () => {
    const lines = selectedBulkLeads.map((lead) => `${lead.name} (+56 ${lead.phone}): ${getWhatsAppUrl(lead.phone, renderTemplate(bulkTemplate, lead))}`);
    await navigator.clipboard.writeText(lines.join("\n"));
    showToast(`${lines.length} enlaces personalizados copiados al portapapeles`);
  };

  const inputStyle = { width: "100%", padding: "14px 16px", background: T.inputBg, border: `1px solid ${T.border}`, borderRadius: "12px", color: T.text, fontSize: "14px", outline: "none", fontFamily: "inherit" };
  const selectStyle = { padding: "10px 14px", borderRadius: "10px", background: T.inputBg, border: `1px solid ${T.border}`, color: T.text, fontSize: "13px", fontWeight: 700, outline: "none", cursor: "pointer", fontFamily: "inherit" };
  const greenBtn = { background: "linear-gradient(135deg, #25D366 0%, #1ebe5a 100%)", color: "#FFFFFF", fontWeight: 800, padding: "16px", borderRadius: "12px", border: "none", fontSize: "15px", boxShadow: "0 4px 20px rgba(37, 211, 102, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transition: "all 0.2s" };
  const tagBtn = { padding: "4px 10px", borderRadius: "8px", border: `1px solid ${T.accent}40`, background: `${T.accent}10`, color: T.accent, fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" };
  const actionBtn = { padding: "8px 14px", borderRadius: "10px", border: `1px solid ${T.accent}40`, background: `${T.accent}10`, color: T.accent, fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" };
  const ghostBtn = { padding: "8px 14px", borderRadius: "10px", border: `1px solid ${T.border}`, background: "transparent", color: T.muted, fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" };
  const card = { background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: "24px", padding: "36px", boxShadow: "0 20px 50px rgba(0, 0, 0, 0.15)", maxWidth: "900px", margin: "0 auto" };

  return (
    <div style={card}>
      <h2 style={{ fontSize: "20px", fontWeight: 800, color: T.accent, marginBottom: 6 }}>
        <i className="bi bi-whatsapp" style={{ marginRight: 8, color: "#25D366" }}></i>
        Mensajes Directos WhatsApp
      </h2>
      <p style={{ fontSize: "13px", color: T.muted, marginBottom: 24 }}>
        Escribe una plantilla, selecciona clientes y envía mensajes personalizados en masa automáticamente.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 24, background: T.inputBg, padding: 6, borderRadius: "14px", border: `1px solid ${T.border}` }}>
        {[
          { id: "single", icon: "bi-person-fill", label: "Mensaje Individual" },
          { id: "mass", icon: "bi-people-fill", label: "Envío en Masa" },
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => setWaMode(m.id)}
            style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: "14px", fontWeight: 800, transition: "all 0.2s", background: waMode === m.id ? `linear-gradient(135deg, ${T.accent} 0%, ${T.accent2} 100%)` : "transparent", color: waMode === m.id ? "#FFFFFF" : T.muted, boxShadow: waMode === m.id ? T.glowCyan : "none" }}
          >
            <i className={`bi ${m.icon}`}></i>
            {m.label}
          </button>
        ))}
      </div>

      {waMode === "single" && (
        <div>
          <Label T={T}>Cliente Destinatario</Label>
          <div style={{ position: "relative", marginBottom: 20 }}>
            <button
              onClick={() => setClientSelectorOpen((v) => !v)}
              style={{ width: "100%", padding: "14px 16px", background: selectedLead ? T.inputBg : "transparent", border: `2px solid ${selectedLead ? T.accent : T.border}`, borderRadius: "12px", color: selectedLead ? T.text : T.muted, fontSize: "14px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, transition: "all 0.2s" }}
            >
              {selectedLead ? (
                <span style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <i className="bi bi-person-fill" style={{ color: T.accent }}></i>
                  <strong style={{ color: T.text }}>{selectedLead.name}</strong>
                  <span style={{ color: T.muted, fontSize: "13px" }}>+56 {selectedLead.phone}</span>
                  <StatusBadge status={selectedLead.status} T={T} />
                </span>
              ) : (
                <span style={{ display: "flex", alignItems: "center", gap: 8, color: T.muted }}>
                  <i className="bi bi-search"></i>
                  Buscar y seleccionar cliente...
                </span>
              )}
              <i className={`bi ${clientSelectorOpen ? "bi-chevron-up" : "bi-chevron-down"}`} style={{ color: T.muted }}></i>
            </button>

            {clientSelectorOpen && (
              <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: "14px", boxShadow: "0 12px 40px rgba(0,0,0,0.25)", zIndex: 100, maxHeight: "400px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <div style={{ position: "relative", borderBottom: `1px solid ${T.border}` }}>
                  <i className="bi bi-search" style={{ position: "absolute", left: 14, top: 14, color: T.muted }}></i>
                  <input type="text" placeholder="Buscar por nombre, teléfono o ciudad..." autoFocus value={clientSearch} onChange={(e) => setClientSearch(e.target.value)} style={{ width: "100%", padding: "12px 14px 12px 40px", background: "transparent", border: "none", color: T.text, fontSize: "14px", outline: "none" }} />
                </div>
                <div style={{ overflowY: "auto", flex: 1 }}>
                  {filteredLeadsForSelector.length === 0 ? (
                    <div style={{ padding: "30px", textAlign: "center", color: T.muted, fontSize: "14px" }}>No se encontraron clientes.</div>
                  ) : (
                    filteredLeadsForSelector.map((lead) => (
                      <div
                        key={lead.id}
                        onClick={() => selectClient(lead)}
                        onMouseEnter={(e) => (e.currentTarget.style.background = `${T.accent}10`)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, cursor: "pointer", borderBottom: `1px solid ${T.border}` }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <Avatar name={lead.name} T={T} />
                          <div>
                            <div style={{ fontSize: "14px", fontWeight: 700, color: T.text }}>{lead.name}</div>
                            <div style={{ fontSize: "12px", color: T.muted }}>+56 {lead.phone} · {lead.city}</div>
                          </div>
                        </div>
                        <StatusBadge status={lead.status} T={T} />
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <Label T={T}>Mensaje Personalizado</Label>
          <textarea
            rows={5}
            value={whatsappMsg}
            onChange={(e) => setWhatsappMsg(e.target.value)}
            disabled={!selectedLead}
            placeholder={selectedLead ? `Escribe tu mensaje para ${selectedLead.name}...` : "Primero selecciona un cliente..."}
            style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6, background: selectedLead ? T.inputBg : "rgba(128,128,128,0.05)" }}
          />
          <span style={{ fontSize: "11px", color: T.muted, marginTop: 6, display: "block", marginBottom: 24 }}>
            {whatsappMsg.length} caracteres · {whatsappMsg.length > 0 ? "Listo para enviar" : "Escribe el mensaje para el cliente"}
          </span>

          <button
            onClick={sendCustomWhatsApp}
            disabled={!selectedLead || !whatsappMsg.trim()}
            style={{ ...greenBtn, width: "100%", cursor: !selectedLead || !whatsappMsg.trim() ? "not-allowed" : "pointer", opacity: !selectedLead || !whatsappMsg.trim() ? 0.5 : 1 }}
          >
            <i className="bi bi-whatsapp" style={{ fontSize: 20 }}></i>
            {selectedLead ? `Enviar WhatsApp a ${selectedLead.name}` : "Selecciona un cliente para enviar"}
          </button>
        </div>
      )}

      {waMode === "mass" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 16 : 24, marginBottom: 24 }}>
            <div>
              <Label T={T}>Plantilla del Mensaje</Label>
              <textarea rows={6} value={bulkTemplate} onChange={(e) => setBulkTemplate(e.target.value)} placeholder="Escribe el mensaje usando variables..." style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5, fontSize: "13px" }} />
              <span style={{ fontSize: "11px", color: T.muted, marginTop: 8, display: "block" }}>Las variables se reemplazan automáticamente por los datos de cada cliente.</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
                {VARS.map((v) => (
                  <button key={v.tag} type="button" onClick={() => setBulkTemplate((prev) => `${prev} ${v.tag}`)} style={tagBtn}>
                    <i className="bi bi-plus-lg" style={{ marginRight: 4 }}></i>
                    {v.label}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => setBulkTemplate(DEFAULT_TEMPLATE)} style={{ marginTop: 10, padding: "6px 12px", borderRadius: "8px", border: `1px solid ${T.border}`, background: "transparent", color: T.muted, fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                <i className="bi bi-arrow-counterclockwise" style={{ marginRight: 4 }}></i>
                Restaurar plantilla por defecto
              </button>
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
            <button onClick={selectAllBulkFiltered} style={actionBtn}>
              <i className="bi bi-check2-all" style={{ marginRight: 6 }}></i>
              Seleccionar filtrados ({bulkFilteredLeads.length})
            </button>
            <button onClick={clearBulkSelection} style={ghostBtn}>
              <i className="bi bi-x-lg" style={{ marginRight: 6 }}></i>
              Limpiar selección
            </button>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: "13px", fontWeight: 800, color: selectedBulkLeads.length > 0 ? T.accent : T.muted }}>
                <i className="bi bi-people-fill" style={{ marginRight: 4 }}></i>
                {selectedBulkLeads.length} seleccionados
              </span>
            </div>
          </div>

          <div style={{ border: `1px solid ${T.border}`, borderRadius: "14px", maxHeight: "320px", overflowY: "auto", marginBottom: 20 }}>
            {bulkFilteredLeads.length === 0 ? (
              <div style={{ padding: "30px", textAlign: "center", color: T.muted, fontSize: "14px" }}>
                <i className="bi bi-inbox" style={{ fontSize: 28, opacity: 0.5, display: "block", marginBottom: 8 }}></i>
                No hay clientes que coincidan con los filtros.
              </div>
            ) : (
              bulkFilteredLeads.map((lead) => {
                const checked = bulkSelectedIds.includes(lead.id);
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
                  </div>
                );
              })
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
            <label style={{ fontSize: "12px", fontWeight: 700, color: T.muted }}>Espera entre mensajes:</label>
            <input type="range" min="300" max="3000" step="100" value={bulkDelay} onChange={(e) => setBulkDelay(Number(e.target.value))} style={{ flex: "0 1 200px", accentColor: T.accent }} />
            <span style={{ fontSize: "12px", fontWeight: 700, color: T.accent }}>{(bulkDelay / 1000).toFixed(1)}s</span>
            <div style={{ flex: "1 1 100%", fontSize: "11px", color: T.muted, display: "flex", alignItems: "center", gap: 6 }}>
              <i className="bi bi-info-circle-fill" style={{ color: T.secondary }}></i>
              Permite que cada pestaña cargue antes de abrir la siguiente. Evita que el navegador bloquee pop-ups.
            </div>
          </div>

          {bulkSending && (
            <div style={{ marginBottom: 20, padding: "16px", borderRadius: "12px", background: `${T.accent}10`, border: `1px solid ${T.accent}30` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: T.accent, display: "flex", alignItems: "center", gap: 6 }}>
                  <i className="bi bi-arrow-clockwise" style={{ animation: "spin 1s linear infinite" }}></i>
                  Enviando mensajes...
                </span>
                <span style={{ fontSize: "13px", fontWeight: 800, color: T.text }}>
                  {bulkProgress.sent} / {bulkProgress.total}
                </span>
              </div>
              <div style={{ height: "8px", background: T.inputBg, borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ width: `${(bulkProgress.sent / Math.max(bulkProgress.total, 1)) * 100}%`, height: "100%", background: `linear-gradient(90deg, ${T.accent}, ${T.accent2})`, borderRadius: "4px", transition: "width 0.3s ease" }} />
              </div>
              {bulkProgress.current && (
                <div style={{ fontSize: "12px", color: T.muted, marginTop: 8 }}>
                  Abriendo chat de <strong style={{ color: T.text }}>{bulkProgress.current.name}</strong> (+56 {bulkProgress.current.phone})...
                </div>
              )}
            </div>
          )}

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              onClick={sendBulkWhatsApp}
              disabled={selectedBulkLeads.length === 0 || bulkSending}
              style={{ ...greenBtn, flex: "1 1 240px", cursor: selectedBulkLeads.length === 0 || bulkSending ? "not-allowed" : "pointer", opacity: selectedBulkLeads.length === 0 || bulkSending ? 0.5 : 1 }}
            >
              <i className="bi bi-whatsapp" style={{ fontSize: 20 }}></i>
              {selectedBulkLeads.length > 0 ? `Enviar a ${selectedBulkLeads.length} clientes` : "Selecciona clientes"}
            </button>
            <button
              onClick={copyBulkLinks}
              disabled={selectedBulkLeads.length === 0 || bulkSending}
              style={{ flex: "0 1 200px", background: "transparent", color: T.accent, fontWeight: 700, padding: "16px", borderRadius: "12px", border: `1px solid ${T.accent}40`, cursor: selectedBulkLeads.length === 0 || bulkSending ? "not-allowed" : "pointer", fontSize: "14px", opacity: selectedBulkLeads.length === 0 || bulkSending ? 0.5 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s" }}
            >
              <i className="bi bi-clipboard-check-fill"></i>
              Copiar enlaces
            </button>
          </div>

          <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: "12px", background: "rgba(253, 220, 2, 0.08)", border: `1px solid ${T.secondary}30`, display: "flex", alignItems: "flex-start", gap: 10 }}>
            <i className="bi bi-exclamation-triangle-fill" style={{ color: T.secondary, fontSize: 16, marginTop: 2 }}></i>
            <span style={{ fontSize: "12px", color: T.muted, lineHeight: 1.5 }}>
              <strong style={{ color: T.text }}>Importante:</strong> se abrirá una pestaña nueva por cada cliente con el mensaje ya cargado. Permite los pop-ups emergentes en tu navegador para que funcione. WhatsApp no envía el mensaje automáticamente — tú debes pulsar {`"Enviar"`} en cada chat.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
