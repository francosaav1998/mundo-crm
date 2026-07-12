"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

function normalizeWhatsApp(number) {
  if (!number) return "";
  const digits = String(number).replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("569")) return digits;
  if (digits.length === 9 && digits.startsWith("9")) return `56${digits}`;
  if (digits.length === 11 && digits.startsWith("56") && !digits.startsWith("569")) return `569${digits.slice(2)}`;
  return digits;
}

export default function RegistroPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    bio: "",
    password: "",
    company: "",
  });
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    async function loadCompanies() {
      try {
        const res = await fetch("/api/companies");
        if (!res.ok) return;
        const data = await res.json();
        setCompanies(data);
        if (data.length > 0 && !form.company) {
          setForm((prev) => ({ ...prev, company: data[0].slug }));
        }
      } catch {
        // Fallback silencioso
      }
    }
    loadCompanies();
  }, [form.company]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (form.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setLoading(false);
      return;
    }

    if (!form.phone) {
      setError("El WhatsApp es obligatorio para que los clientes te contacten");
      setLoading(false);
      return;
    }

    if (!form.company) {
      setError("Debes seleccionar la compañía a la que perteneces");
      setLoading(false);
      return;
    }

    const normalizedPhone = normalizeWhatsApp(form.phone);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.name,
            company: form.company,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        setSuccess(true);
        // Si Supabase requiere confirmación por email, data.session será null.
        if (data.session) {
          setTimeout(() => router.push("/dashboard"), 1500);
        } else {
          setNeedsConfirmation(true);
        }
      }
    } catch (err) {
      setError(err.message || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    background: "#F8FAFC",
    border: "2px solid #E2E8F0",
    borderRadius: "12px",
    color: "#1E293B",
    fontSize: "14px",
    fontWeight: 600,
    outline: "none",
    transition: "border-color 0.2s",
  };

  const labelStyle = {
    display: "block",
    fontSize: "12px",
    fontWeight: 700,
    color: "#1E293B",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "6px",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #005A6F 0%, #00748E 100%)",
        color: "#F8FAFC",
        fontFamily: "'Montserrat', sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: `
            radial-gradient(circle at 10% 20%, rgba(253, 220, 2, 0.12) 0%, transparent 35%),
            radial-gradient(circle at 90% 80%, rgba(0, 180, 216, 0.15) 0%, transparent 40%)
          `,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div style={{ width: "100%", maxWidth: "500px", zIndex: 1, textAlign: "center" }}>
        <div style={{ marginBottom: "24px" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              background: "#FFFFFF",
              borderRadius: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
            }}
          >
            <span style={{ color: "#00748E", fontWeight: 900, fontSize: "26px" }}>M</span>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, letterSpacing: "-0.02em" }}>
            Únete como Ejecutiva Mundo
          </h1>
          <p style={{ color: "rgba(248, 250, 252, 0.85)", fontSize: "13px", marginTop: "6px" }}>
            Completa tus datos y obtén tu landing personalizada
          </p>
        </div>

        <div
          style={{
            background: "#FFFFFF",
            borderRadius: "24px",
            padding: "32px",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.25)",
            textAlign: "left",
          }}
        >
          {error && (
            <div
              style={{
                background: "rgba(239, 68, 68, 0.08)",
                color: "#DC2626",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                padding: "12px 16px",
                borderRadius: "12px",
                fontSize: "13px",
                fontWeight: 700,
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <i className="bi bi-exclamation-triangle-fill"></i>
              {error}
            </div>
          )}

          {success && (
            <div
              style={{
                background: "rgba(37, 211, 102, 0.1)",
                color: "#16a34a",
                border: "1px solid rgba(37, 211, 102, 0.25)",
                padding: "14px 16px",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: 700,
                marginBottom: "20px",
                textAlign: "center",
              }}
            >
              <i className="bi bi-check-circle-fill" style={{ marginRight: "8px" }}></i>
              {needsConfirmation
                ? "¡Cuenta creada! Revisa tu correo para confirmar y luego inicia sesión."
                : "¡Cuenta creada! Redirigiendo a tu dashboard..."}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={labelStyle}>Nombre completo *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                required
                placeholder="María González"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#00748E")}
                onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  required
                  placeholder="maria@gmail.com"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#00748E")}
                  onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
                />
              </div>

              <div>
                <label style={labelStyle}>Contraseña *</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  required
                  placeholder="Mín. 6 caracteres"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#00748E")}
                  onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ ...labelStyle, color: "#DC2626" }}>WhatsApp *</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  required
                  placeholder="+56912345678"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#00748E")}
                  onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
                />
                <p style={{ fontSize: "11px", color: "#64748B", marginTop: "4px" }}>
                  Los clientes te contactarán aquí
                </p>
              </div>

              <div>
                <label style={labelStyle}>Ciudad / Región</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  placeholder="Santiago (opcional)"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#00748E")}
                  onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
                />
              </div>
            </div>

            <div>
              <label style={{ ...labelStyle, color: "#DC2626" }}>Compañía a la que vendes *</label>
              <select
                value={form.company}
                onChange={(e) => update("company", e.target.value)}
                required
                style={{
                  ...inputStyle,
                  appearance: "none",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%2364748B' viewBox='0 0 16 16'%3E%3Cpath d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 1rem center",
                  paddingRight: "2.5rem",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#00748E")}
                onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
              >
                <option value="" disabled>
                  Selecciona tu compañía
                </option>
                {companies.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
              <p style={{ fontSize: "11px", color: "#64748B", marginTop: "4px" }}>
                Esta compañía quedará asignada permanentemente a tu cuenta.
              </p>
            </div>

            <div>
              <label style={labelStyle}>Bio / Presentación (opcional)</label>
              <textarea
                value={form.bio}
                onChange={(e) => update("bio", e.target.value)}
                placeholder="Como tu ejecutiva comercial especializada, te ayudo a gestionar tu contrato..."
                rows={3}
                style={{ ...inputStyle, resize: "none", lineHeight: "1.5" }}
                onFocus={(e) => (e.target.style.borderColor = "#00748E")}
                onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
              />
              <p style={{ fontSize: "11px", color: "#64748B", marginTop: "4px" }}>
                Si lo dejas vacío, usaremos un texto por defecto. Podrás editarlo después.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              style={{
                width: "100%",
                background: "linear-gradient(135deg, #00748E 0%, #005A6F 100%)",
                color: "#FFFFFF",
                fontWeight: 800,
                padding: "14px",
                borderRadius: "12px",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "14px",
                boxShadow: "0 4px 20px rgba(0, 116, 142, 0.35)",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                marginTop: "4px",
              }}
            >
              {loading ? "Creando cuenta..." : "Crear mi cuenta y dashboard"}
            </button>
          </form>

          <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #E2E8F0", textAlign: "center" }}>
            <p style={{ fontSize: "13px", color: "#64748B", marginBottom: "6px" }}>¿Ya tienes cuenta?</p>
            <button
              onClick={() => router.push("/dashboard/login")}
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#00748E",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              Iniciar sesión →
            </button>
          </div>
        </div>

        <p style={{ fontSize: "11px", color: "rgba(248, 250, 252, 0.6)", marginTop: "16px" }}>
          Al registrarte, aceptas nuestra{" "}
          <a href="/politica-de-privacidad" style={{ color: "rgba(248, 250, 252, 0.8)" }}>
            Política de Privacidad
          </a>
        </p>
      </div>
    </div>
  );
}