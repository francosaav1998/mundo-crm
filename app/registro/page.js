"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { NEON_THEME } from "@/lib/dashboard/constants";

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
  const T = NEON_THEME.dark;
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
  const [acceptedTerms, setAcceptedTerms] = useState(false);
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

    if (!acceptedTerms) {
      setError("Debes aceptar los términos y la política de privacidad");
      setLoading(false);
      return;
    }

    try {
      const registerRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          name: form.name,
          phone: normalizedPhone,
          bio: form.bio,
          companySlug: form.company,
          acceptedTerms,
        }),
      });

      const registerData = await registerRes.json().catch(() => ({}));
      if (!registerRes.ok) throw new Error(registerData.error || "Error al registrarse");

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (signInError) throw signInError;

      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 900);
    } catch (err) {
      setError(err.message || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    background: T.inputBg,
    border: `1px solid ${T.border}`,
    borderRadius: "12px",
    color: T.text,
    fontSize: "14px",
    fontWeight: 600,
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  const labelStyle = {
    display: "block",
    fontSize: "12px",
    fontWeight: 700,
    color: T.text,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "6px",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: T.bgGradient,
        color: T.text,
        fontFamily: "var(--font-body), system-ui, sans-serif",
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
            radial-gradient(circle at 10% 20%, rgba(212, 165, 116, 0.12) 0%, transparent 35%),
            radial-gradient(circle at 90% 80%, rgba(128, 128, 255, 0.10) 0%, transparent 40%)
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
              background: T.bgCard,
              border: `1px solid ${T.border}`,
              borderRadius: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              boxShadow: T.glowGold,
            }}
          >
            <span style={{ color: T.accent, fontWeight: 900, fontSize: "26px" }}>M</span>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, letterSpacing: "-0.02em" }}>
            Únete como Ejecutiva Mundo
          </h1>
          <p style={{ color: T.muted, fontSize: "13px", marginTop: "6px" }}>
            Completa tus datos y obtén tu landing personalizada
          </p>
        </div>

        <div
          style={{
            background: T.bgCard,
            border: `1px solid ${T.border}`,
            borderRadius: "24px",
            padding: "32px",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.25)",
            textAlign: "left",
            backdropFilter: "blur(20px)",
          }}
        >
          {error && (
            <div
              style={{
                background: "rgba(239, 68, 68, 0.08)",
                color: "#EF4444",
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
                color: "#10B981",
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
              {"¡Cuenta creada! Redirigiendo a tu dashboard..."}
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
                 onFocus={(e) => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = T.glowGold; }}
                 onBlur={(e) => { e.target.style.borderColor = T.border; e.target.style.boxShadow = "none"; }}
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
                   onFocus={(e) => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = T.glowGold; }}
                   onBlur={(e) => { e.target.style.borderColor = T.border; e.target.style.boxShadow = "none"; }}
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
                   onFocus={(e) => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = T.glowGold; }}
                   onBlur={(e) => { e.target.style.borderColor = T.border; e.target.style.boxShadow = "none"; }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                 <label style={{ ...labelStyle, color: T.accent }}>WhatsApp *</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  required
                  placeholder="+56912345678"
                   style={inputStyle}
                   onFocus={(e) => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = T.glowGold; }}
                   onBlur={(e) => { e.target.style.borderColor = T.border; e.target.style.boxShadow = "none"; }}
                 />
                 <p style={{ fontSize: "11px", color: T.muted, marginTop: "4px" }}>
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
                   onFocus={(e) => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = T.glowGold; }}
                   onBlur={(e) => { e.target.style.borderColor = T.border; e.target.style.boxShadow = "none"; }}
                />
              </div>
            </div>

            <div>
               <label style={{ ...labelStyle, color: T.accent }}>Compañía a la que vendes *</label>
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
                 onFocus={(e) => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = T.glowGold; }}
                 onBlur={(e) => { e.target.style.borderColor = T.border; e.target.style.boxShadow = "none"; }}
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
               <p style={{ fontSize: "11px", color: T.muted, marginTop: "4px" }}>
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
                 onFocus={(e) => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = T.glowGold; }}
                 onBlur={(e) => { e.target.style.borderColor = T.border; e.target.style.boxShadow = "none"; }}
               />
               <p style={{ fontSize: "11px", color: T.muted, marginTop: "4px" }}>
                 Si lo dejas vacío, usaremos un texto por defecto. Podrás editarlo después.
               </p>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              style={{
                width: "100%",
                 background: `linear-gradient(135deg, ${T.accent} 0%, ${T.accent2} 100%)`,
                 color: "#FFFFFF",
                fontWeight: 800,
                padding: "14px",
                borderRadius: "12px",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "14px",
                 boxShadow: T.glowGold,
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

            <label style={{ display: "flex", alignItems: "flex-start", gap: 10, marginTop: 4, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                style={{ marginTop: 3 }}
              />
              <span style={{ fontSize: "12px", color: T.muted, lineHeight: 1.5 }}>
                Acepto los <span style={{ color: T.accent, fontWeight: 700 }}>Términos y Condiciones</span> y la{" "}
                <a href="/politica-de-privacidad" style={{ color: T.accent, fontWeight: 700 }}>Política de Privacidad</a>.
              </span>
            </label>
          </form>

          <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: `1px solid ${T.border}`, textAlign: "center" }}>
            <p style={{ fontSize: "13px", color: T.muted, marginBottom: "6px" }}>¿Ya tienes cuenta?</p>
            <button
              onClick={() => router.push("/dashboard/login")}
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: T.accent,
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              Iniciar sesión →
            </button>
          </div>
        </div>

        <p style={{ fontSize: "11px", color: T.muted, marginTop: "16px" }}>
          El acceso se activa al instante y comienza tu prueba gratis de 7 días.
        </p>
      </div>
    </div>
  );
}
