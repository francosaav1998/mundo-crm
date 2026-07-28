"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  return (
    <Suspense fallback={<RegistroFallback />}>
      <RegistroPageInner />
    </Suspense>
  );
}

function RegistroFallback() {
  const T = NEON_THEME.dark;
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
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: "48px",
            height: "48px",
            border: "3px solid " + T.border,
            borderTop: "3px solid " + T.accent,
            borderRadius: "50%",
            margin: "0 auto 16px",
            animation: "spin 1s linear infinite",
          }}
        />
        <p style={{ color: T.muted, fontSize: "14px" }}>Cargando...</p>
      </div>
    </div>
  );
}

function RegistroPageInner() {
  const T = NEON_THEME.dark;
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

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
  const [oauthLoading, setOauthLoading] = useState(false);
  const [oauthUser, setOauthUser] = useState(null);
  const [loadingOauthData, setLoadingOauthData] = useState(false);

  // Redirigir al dashboard cuando el registro se completa
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, router]);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  // Si viene de OAuth, precargar datos del usuario
  useEffect(() => {
    if (searchParams.get("oauth") === "true") {
      setLoadingOauthData(true);
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const meta = session.user.user_metadata || {};
          setOauthUser(session.user);
          setForm((prev) => ({
            ...prev,
            name: meta.full_name || meta.name || prev.name,
            email: session.user.email || prev.email,
          }));
        }
        setLoadingOauthData(false);
      });
    }
  }, [searchParams]);

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

  async function handleOAuth(provider) {
    setOauthLoading(true);
    setError("");
    try {
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (err) setError(err.message);
    } catch (e) {
      setError(e.message);
    } finally {
      setOauthLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

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

    if (!acceptedTerms) {
      setError("Debes aceptar los términos y la política de privacidad");
      setLoading(false);
      return;
    }

    const normalizedPhone = normalizeWhatsApp(form.phone);

    try {
      if (oauthUser) {
        // Usuario vino de OAuth — ya tiene sesión, solo actualizar perfil
        const res = await fetch("/api/me/seller", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            phone: normalizedPhone,
            city: form.city,
            bio: form.bio,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Error al guardar perfil");
        }
        // Sincronizar compañía — pasar company como query param para que findOrCreateSellerForUser la asigne
        const companyRes = await fetch(`/api/me/seller?company=${encodeURIComponent(form.company)}`);
        if (!companyRes.ok) {
          const companyData = await companyRes.json().catch(() => ({}));
          throw new Error(companyData.error || "Error al asignar compañía");
        }
        setSuccess(true);
      } else {
        // Usuario nuevo — registro completo
        if (form.password.length < 6) {
          setError("La contraseña debe tener al menos 6 caracteres");
          setLoading(false);
          return;
        }

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
            Únete a Gestion Vendedores
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



          {!oauthUser && !loadingOauthData && (
            <>
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                marginBottom: "24px",
              }}>
                <button
                  type="button"
                  onClick={() => handleOAuth("google")}
                  disabled={oauthLoading || loading || success}
                  style={{
                    width: "100%",
                    background: "#FFFFFF",
                    color: "#1E293B",
                    border: "1px solid " + T.border,
                    fontWeight: 700,
                    padding: "14px",
                    borderRadius: "12px",
                    cursor: oauthLoading || loading ? "not-allowed" : "pointer",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (!oauthLoading && !loading) {
                      e.target.style.borderColor = T.accent;
                      e.target.style.boxShadow = T.glowGold;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = T.border;
                    e.target.style.boxShadow = "none";
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {oauthLoading ? "Conectando..." : "Continuar con Google"}
                </button>
              </div>

              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginBottom: "24px",
              }}>
                <div style={{ flex: 1, height: "1px", background: T.border }} />
                <span style={{ fontSize: "13px", color: T.muted, fontWeight: 600, whiteSpace: "nowrap" }}>
                  O continúa con email
                </span>
                <div style={{ flex: 1, height: "1px", background: T.border }} />
              </div>
            </>
          )}

          {oauthUser && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 16px",
              background: "rgba(37, 211, 102, 0.06)",
              border: "1px solid rgba(37, 211, 102, 0.15)",
              borderRadius: "12px",
              marginBottom: "20px",
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "13px", fontWeight: 700, color: T.text }}>
                  Autenticado con Google
                </p>
                <p style={{ fontSize: "12px", color: T.muted }}>
                  {oauthUser?.email} — Completa los campos faltantes y finaliza
                </p>
              </div>
            </div>
          )}

          {loadingOauthData && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{
                width: "32px",
                height: "32px",
                border: "3px solid " + T.border,
                borderTop: "3px solid " + T.accent,
                borderRadius: "50%",
                margin: "0 auto",
                animation: "spin 1s linear infinite",
              }} />
              <p style={{ fontSize: "13px", color: T.muted, marginTop: "12px" }}>Cargando datos...</p>
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

            <div style={{ display: "grid", gridTemplateColumns: oauthUser ? "1fr" : "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  required
                  disabled={!!oauthUser}
                  placeholder="maria@gmail.com"
                   style={{ ...inputStyle, opacity: oauthUser ? 0.6 : 1 }}
                   onFocus={(e) => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = T.glowGold; }}
                   onBlur={(e) => { e.target.style.borderColor = T.border; e.target.style.boxShadow = "none"; }}
                />
              </div>

              {!oauthUser && (
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
              )}
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
                placeholder="Ej: Como tu ejecutivo/a comercial, te ayudo a gestionar tu contrato..."
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
              {loading ? (oauthUser ? "Finalizando..." : "Creando cuenta...") : (oauthUser ? "Finalizar" : "Crear mi cuenta y dashboard")}
            </button>

            <label style={{ display: "flex", alignItems: "flex-start", gap: 10, marginTop: 4, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                style={{ marginTop: 3 }}
              />
              <span style={{ fontSize: "12px", color: T.muted, lineHeight: 1.5 }}>
                Acepto los <a href="/terminos-y-condiciones" style={{ color: T.accent, fontWeight: 700 }}>Términos y Condiciones</a> y la{" "}
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
