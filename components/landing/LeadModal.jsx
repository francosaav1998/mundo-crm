"use client";

import { useEffect, useState } from "react";

const DEFAULT_OPTIONS = ["Necesito Asesoría / Otro"];

export default function LeadModal({ isOpen, onClose, sellerId, sellerName, initialPlan = "", plans = [], companySlug = "mundo" }) {
  const planOptions = plans.length > 0
    ? [...plans.map((p) => p.value), ...DEFAULT_OPTIONS]
    : DEFAULT_OPTIONS;

  const defaultPlan = initialPlan || planOptions[0] || DEFAULT_OPTIONS[0];

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    address: "",
    plan: defaultPlan,
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (typeof window !== "undefined" && window.fbq) {
        window.fbq("track", "ViewContent");
      }
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const update = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      const selectedPlan = plans.find((p) => p.value === formData.plan);
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, sellerId, planId: selectedPlan?.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al enviar");

      if (typeof window !== "undefined" && window.fbq) {
        window.fbq("track", "Lead");
      }

      setStatus({
        type: "success",
        message: sellerName
          ? `¡Solicitud enviada! ${sellerName} te contactará pronto.`
          : "¡Solicitud enviada! Te contactaremos pronto.",
      });
      setFormData({
        name: "",
        phone: "",
        email: "",
        city: "",
        address: "",
        plan: defaultPlan,
      });
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        background: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          maxHeight: "90vh",
          overflowY: "auto",
          background: "#FFFFFF",
          borderRadius: "24px",
          padding: "clamp(20px, 4vw, 28px)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.35)",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "transparent",
            border: "none",
            fontSize: "22px",
            cursor: "pointer",
            color: "#64748B",
          }}
          aria-label="Cerrar"
        >
          <i className="bi bi-x-lg"></i>
        </button>

        <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#00748E", marginBottom: "6px" }}>
          Consultar Factibilidad
        </h2>
        <p style={{ fontSize: "13px", color: "#64748B", marginBottom: "20px" }}>
          Completa tus datos y recibe una respuesta personalizada.
        </p>

        {status.message && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: "12px",
              marginBottom: "18px",
              fontSize: "13px",
              fontWeight: 700,
              background: status.type === "success" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
              color: status.type === "success" ? "#10B981" : "#EF4444",
              border: `1px solid ${status.type === "success" ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
            }}
          >
            {status.type === "success" ? (
              <i className="bi bi-check-circle-fill" style={{ marginRight: "8px" }}></i>
            ) : (
              <i className="bi bi-exclamation-triangle-fill" style={{ marginRight: "8px" }}></i>
            )}
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#1E293B", marginBottom: "6px" }}>
              Nombre y Apellido *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Ej. Juan Pérez"
              style={{
                width: "100%",
                padding: "12px 14px",
                border: "2px solid #E2E8F0",
                borderRadius: "12px",
                fontSize: "14px",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#1E293B", marginBottom: "6px" }}>
              Número de Contacto *
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="Ej. +569 1234 5678"
              style={{
                width: "100%",
                padding: "12px 14px",
                border: "2px solid #E2E8F0",
                borderRadius: "12px",
                fontSize: "14px",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#1E293B", marginBottom: "6px" }}>
              Correo Electrónico
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="Ej. juan@correo.cl"
              style={{
                width: "100%",
                padding: "12px 14px",
                border: "2px solid #E2E8F0",
                borderRadius: "12px",
                fontSize: "14px",
                outline: "none",
              }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#1E293B", marginBottom: "6px" }}>
                Comuna / Ciudad *
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => update("city", e.target.value)}
                placeholder="Ej. Concepción"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "2px solid #E2E8F0",
                  borderRadius: "12px",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#1E293B", marginBottom: "6px" }}>
                Dirección *
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => update("address", e.target.value)}
                placeholder="Ej. Av. Central 1234"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "2px solid #E2E8F0",
                  borderRadius: "12px",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#1E293B", marginBottom: "6px" }}>
              Plan de Interés
            </label>
            <select
              value={formData.plan}
              onChange={(e) => update("plan", e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                border: "2px solid #E2E8F0",
                borderRadius: "12px",
                fontSize: "14px",
                outline: "none",
                background: "#FFFFFF",
              }}
            >
              {planOptions.map((option) => (
                <option key={option} value={option}>
                  {option.replace(")", "/mes)")}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: "100%",
              marginTop: "8px",
              padding: "14px",
              borderRadius: "12px",
              border: "none",
              background: "linear-gradient(135deg, #FF8000 0%, #e07000 100%)",
              color: "#FFFFFF",
              fontWeight: 800,
              fontSize: "15px",
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <i className="bi bi-send-fill"></i>
            {submitting ? "Enviando..." : "Enviar solicitud"}
          </button>

          <p style={{ fontSize: "11px", color: "#94A3B8", textAlign: "center" }}>
            Al enviar, aceptas nuestra{" "}
            <a href={`/politica-de-privacidad?company=${companySlug}`} style={{ color: "#00748E", fontWeight: 700 }}>
              Política de Privacidad
            </a>
            .
          </p>
        </form>
      </div>
    </div>
  );
}
