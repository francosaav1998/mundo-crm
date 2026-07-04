"use client";

import { useMemo, useState } from "react";
import { STATUSES, STATUS_CONFIG } from "@/lib/dashboard/constants";

export default function ImportData({ leads, T, isMobile, showToast, onImportSuccess }) {
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const handleImportUpload = async () => {
    if (!importFile) return;
    setImporting(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append("file", importFile);

      const res = await fetch("/api/leads/import", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setImportResult({ type: "error", message: data.error || "Error al importar" });
        return;
      }

      setImportResult({
        type: "success",
        message: `${data.imported} clientes importados correctamente${data.skipped > 0 ? ` (${data.skipped} filas omitidas)` : ""}`,
      });
      setImportFile(null);
      showToast?.(`${data.imported} clientes importados exitosamente`);
      onImportSuccess?.();
    } catch {
      setImportResult({ type: "error", message: "Error de conexión al subir el archivo" });
    } finally {
      setImporting(false);
    }
  };

  const stats = useMemo(() => {
    const total = leads.length;
    const byStatus = {};
    STATUSES.forEach((s) => {
      byStatus[s] = leads.filter((l) => l.status === s).length;
    });

    const byCity = {};
    leads.forEach((l) => {
      if (l.city) byCity[l.city] = (byCity[l.city] || 0) + 1;
    });
    const topCities = Object.entries(byCity)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    const byPlan = {};
    leads.forEach((l) => {
      const name = l.plan ? l.plan.split(" (")[0] : "Sin Plan";
      byPlan[name] = (byPlan[name] || 0) + 1;
    });
    const topPlans = Object.entries(byPlan)
      .map(([name, value]) => ({ name, value: name === "Sin Plan" ? -value : value }))
      .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
      .slice(0, 5)
      .map((p) => ({ ...p, value: Math.abs(p.value) }));

    return { total, byStatus, topCities, topPlans };
  }, [leads]);

  const cityColors = [T.accent, T.accent2, T.accent4, T.secondary, "#FF6B35", "#A855F7"];
  const planColors = [T.accent, T.accent2, T.accent4, T.secondary, "#FF6B35"];

  const summary = [
    { label: "Total Clientes", value: stats.total, icon: "bi-people-fill", color: T.accent },
    { label: "Nuevos", value: stats.byStatus["Nuevo"] || 0, icon: "bi-star-fill", color: "#00B4D8" },
    { label: "Contactados", value: (stats.byStatus["Contactado"] || 0) + (stats.byStatus["En Proceso"] || 0), icon: "bi-chat-dots-fill", color: "#25D366" },
    { label: "Con Factibilidad", value: stats.byStatus["Con Factibilidad"] || 0, icon: "bi-check-circle-fill", color: "#10B981" },
    { label: "Sin Factibilidad", value: stats.byStatus["Sin Factibilidad"] || 0, icon: "bi-x-circle-fill", color: "#F97316" },
    { label: "No Contesta", value: stats.byStatus["No Contesta"] || 0, icon: "bi-telephone-x-fill", color: "#EF4444" },
  ];

  return (
    <div>
      <div
        style={{
          background: T.bgCard,
          border: `1px solid ${T.border}`,
          borderRadius: "24px",
          padding: isMobile ? "24px" : "40px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
          marginBottom: 30,
        }}
      >
        <h2 style={{ fontSize: "20px", fontWeight: 800, color: T.accent, marginBottom: 6 }}>
          <i className="bi bi-file-earmark-spreadsheet-fill" style={{ marginRight: 8 }}></i>
          Importar Base de Datos Excel
        </h2>
        <p style={{ fontSize: "13px", color: T.muted, marginBottom: 30 }}>
          Sube un archivo Excel (.xlsx o .csv) con tus clientes. Columnas esperadas: Nombre, Telefono, Ciudad, Direccion, Plan, Estado.
        </p>

        <label
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            padding: "48px 24px",
            borderRadius: "16px",
            border: `2px dashed ${importFile ? T.accent : T.border}`,
            background: importFile ? `${T.accent}08` : T.inputBg,
            cursor: "pointer",
            transition: "all 0.2s",
            textAlign: "center",
          }}
        >
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            style={{ display: "none" }}
            onChange={(e) => {
              setImportFile(e.target.files[0]);
              setImportResult(null);
            }}
          />
          <i className="bi bi-cloud-arrow-up-fill" style={{ fontSize: 48, color: importFile ? T.accent : T.muted }}></i>
          {importFile ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: "16px", fontWeight: 700, color: T.text }}>{importFile.name}</span>
              <span style={{ fontSize: "12px", color: T.muted }}>
                {(importFile.size / 1024).toFixed(1)} KB · Listo para importar
              </span>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: "16px", fontWeight: 700, color: T.text }}>Haz clic para subir tu archivo Excel</span>
              <span style={{ fontSize: "12px", color: T.muted }}>Formatos soportados: .xlsx, .xls, .csv (máx 5000 filas)</span>
            </div>
          )}
        </label>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 16,
            padding: "12px 16px",
            background: `${T.accent}08`,
            borderRadius: "12px",
            border: `1px solid ${T.accent}20`,
          }}
        >
          <i className="bi bi-info-circle-fill" style={{ color: T.accent, fontSize: 16 }}></i>
          <span style={{ fontSize: "12px", color: T.muted, flex: 1 }}>
            Tu Excel debe tener estos encabezados en la primera fila:
          </span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
          {["Nombre", "Telefono", "Ciudad", "Direccion", "Plan", "Estado"].map((col) => (
            <span
              key={col}
              style={{
                padding: "4px 12px",
                borderRadius: "8px",
                background: `${T.accent}15`,
                border: `1px solid ${T.accent}30`,
                color: T.accent,
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              {col}
            </span>
          ))}
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button
            onClick={handleImportUpload}
            disabled={!importFile || importing}
            style={{
              flex: 1,
              background: `linear-gradient(135deg, ${T.accent} 0%, ${T.accent2} 100%)`,
              color: "#FFFFFF",
              fontWeight: 800,
              padding: "14px",
              borderRadius: "12px",
              border: "none",
              cursor: !importFile || importing ? "not-allowed" : "pointer",
              fontSize: "14px",
              opacity: !importFile || importing ? 0.5 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: T.glowCyan,
              transition: "all 0.2s",
            }}
          >
            {importing ? (
              <>
                <i className="bi bi-arrow-clockwise" style={{ animation: "spin 1s linear infinite" }}></i>
                Importando...
              </>
            ) : (
              <>
                <i className="bi bi-cloud-arrow-up-fill"></i>
                Importar Clientes
              </>
            )}
          </button>
        </div>

        {importResult && (
          <div
            style={{
              marginTop: 16,
              padding: "14px 18px",
              borderRadius: "12px",
              background: importResult.type === "success" ? "rgba(37, 211, 102, 0.1)" : "rgba(239, 68, 68, 0.1)",
              border: `1px solid ${importResult.type === "success" ? "rgba(37, 211, 102, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
              color: importResult.type === "success" ? "#16A34A" : "#DC2626",
              fontSize: "14px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <i className={`bi ${importResult.type === "success" ? "bi-check-circle-fill" : "bi-exclamation-triangle-fill"}`}></i>
            {importResult.message}
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(300px, 1fr))", gap: 30 }}>
        <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: "20px", padding: "30px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: T.accent, marginBottom: 20 }}>
            <i className="bi bi-pie-chart-fill" style={{ marginRight: 6 }}></i>
            Distribución por Estado
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {STATUSES.map((s) => {
              const count = stats.byStatus[s] || 0;
              const pct = stats.total > 0 ? ((count / stats.total) * 100).toFixed(0) : 0;
              const sc = STATUS_CONFIG[s];
              return (
                <div key={s} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                    <span style={{ fontWeight: 600, color: T.text, display: "flex", alignItems: "center", gap: 6 }}>
                      <i className={`bi ${sc?.icon}`} style={{ color: sc?.dot }}></i>
                      {s}
                    </span>
                    <span style={{ fontWeight: 700, color: sc?.text }}>
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div style={{ height: 8, background: T.inputBg, borderRadius: 4, overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: "100%",
                        background: sc?.dot,
                        borderRadius: 4,
                        transition: "width 0.6s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: "20px", padding: "30px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: T.accent, marginBottom: 20 }}>
            <i className="bi bi-geo-alt-fill" style={{ marginRight: 6 }}></i>
            Clientes por Ciudad
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {stats.topCities.map((c, i) => {
              const maxVal = stats.topCities[0]?.value || 1;
              const pct = (c.value / maxVal) * 100;
              return (
                <div key={c.name} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                    <span style={{ fontWeight: 600, color: T.text }}>{c.name}</span>
                    <span style={{ fontWeight: 700, color: cityColors[i] }}>{c.value}</span>
                  </div>
                  <div style={{ height: 8, background: T.inputBg, borderRadius: 4, overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: "100%",
                        background: cityColors[i],
                        borderRadius: 4,
                        transition: "width 0.6s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: "20px", padding: "30px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: T.accent, marginBottom: 20 }}>
            <i className="bi bi-bar-chart-fill" style={{ marginRight: 6 }}></i>
            Planes Más Solicitados
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {stats.topPlans.map((p, i) => {
              const maxVal = stats.topPlans[0]?.value || 1;
              const pct = (p.value / maxVal) * 100;
              return (
                <div key={p.name} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                    <span style={{ fontWeight: 600, color: T.text }}>{p.name}</span>
                    <span style={{ fontWeight: 700, color: planColors[i] }}>{p.value}</span>
                  </div>
                  <div style={{ height: 8, background: T.inputBg, borderRadius: 4, overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: "100%",
                        background: planColors[i],
                        borderRadius: 4,
                        transition: "width 0.6s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div
        style={{
          background: T.bgCard,
          border: `1px solid ${T.border}`,
          borderRadius: "20px",
          padding: "30px",
          marginTop: 30,
        }}
      >
        <h3 style={{ fontSize: "16px", fontWeight: 700, color: T.accent, marginBottom: 20 }}>
          <i className="bi bi-table" style={{ marginRight: 6 }}></i>
          Resumen de Gestión Total
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16 }}>
          {summary.map((stat) => (
            <div
              key={stat.label}
              style={{
                padding: "18px",
                borderRadius: "14px",
                background: T.inputBg,
                border: `1px solid ${T.border}`,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: "12px",
                  background: `${stat.color}20`,
                  border: `1px solid ${stat.color}40`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <i className={`bi ${stat.icon}`} style={{ color: stat.color, fontSize: 18 }}></i>
              </div>
              <div>
                <div style={{ fontSize: "24px", fontWeight: 900, color: T.text }}>{stat.value}</div>
                <div style={{ fontSize: "10px", color: T.muted, fontWeight: 700, textTransform: "uppercase" }}>
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
