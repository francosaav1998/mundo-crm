"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export default function ActualizarPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Verificar que el usuario viene de un link de recuperación válido
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });

    // También verificar si ya hay sesión con recovery
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setReady(true);
      }
    });
  }, [supabase]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    try {
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) throw err;

      // Cerrar sesión para que el usuario vuelva a iniciar con la nueva contraseña
      await supabase.auth.signOut();
      setSuccess(true);
      setTimeout(() => router.push("/dashboard/login"), 2000);
    } catch (err) {
      setError(err.message || "Error al actualizar la contraseña");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f0f1a",
        color: "#f0f0f5",
        fontFamily: "var(--font-body), 'Plus Jakarta Sans', system-ui, sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div style={{
        position: "fixed",
        inset: 0,
        backgroundImage: `
          radial-gradient(ellipse 80% 50% at 50% -10%, rgba(212, 165, 116, 0.14), transparent 60%),
          radial-gradient(circle at 120% 20%, rgba(128, 128, 255, 0.1), transparent 45%),
          radial-gradient(circle at -10% 80%, rgba(212, 165, 116, 0.08), transparent 40%)
        `,
        pointerEvents: "none",
        zIndex: 0,
      }} />

      <div style={{ width: "100%", maxWidth: "420px", zIndex: 1, textAlign: "center" }}>
        <div style={{ marginBottom: "32px" }}>
          <div style={{
            width: "64px",
            height: "64px",
            background: "linear-gradient(135deg, #d4a574 0%, #8080ff 100%)",
            borderRadius: "18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
          }}>
            <i className="bi bi-shield-lock" style={{ color: "#fff", fontSize: "28px" }} />
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.02em", fontFamily: "var(--font-heading), 'Outfit', sans-serif" }}>
            {success ? "Contraseña actualizada" : "Nueva contraseña"}
          </h1>
          <p style={{ color: "rgba(240, 240, 245, 0.65)", fontSize: "14px", marginTop: "6px", fontWeight: 500 }}>
            {success ? "Redirigiendo al inicio de sesión..." : "Ingresa tu nueva contraseña"}
          </p>
        </div>

        <div style={{
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
          borderRadius: "24px",
          padding: "clamp(24px, 4vw, 36px)",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.25)",
          backdropFilter: "blur(20px)",
          textAlign: "left",
        }}>
          {!ready && !success && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{
                width: "36px",
                height: "36px",
                border: "3px solid rgba(255,255,255,0.1)",
                borderTop: "3px solid #d4a574",
                borderRadius: "50%",
                margin: "0 auto 16px",
                animation: "spin 1s linear infinite",
              }} />
              <p style={{ fontSize: "14px", color: "rgba(240, 240, 245, 0.65)" }}>
                Verificando link de recuperación...
              </p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {error && (
            <div style={{
              background: "rgba(239, 68, 68, 0.08)",
              color: "#EF4444",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              padding: "12px 16px",
              borderRadius: "14px",
              fontSize: "13px",
              fontWeight: 600,
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}>
              <i className="bi bi-exclamation-triangle-fill"></i>
              {error}
            </div>
          )}

          {success && (
            <div style={{ textAlign: "center", padding: "10px 0" }}>
              <div style={{
                width: "56px",
                height: "56px",
                background: "rgba(37, 211, 102, 0.1)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}>
                <i className="bi bi-check-lg" style={{ color: "#25D366", fontSize: "28px" }} />
              </div>
              <p style={{ fontSize: "14px", color: "rgba(240, 240, 245, 0.65)" }}>
                Tu contraseña se ha actualizado correctamente.
              </p>
            </div>
          )}

          {ready && !success && (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "8px" }}>
                  Nueva contraseña
                </label>
                <div style={{ position: "relative" }}>
                  <i className="bi bi-lock-fill" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#d4a574" }} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 16px 12px 42px",
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "14px",
                      color: "#f0f0f5",
                      fontSize: "14px",
                      fontWeight: 500,
                      outline: "none",
                      transition: "all 0.2s",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "rgba(212, 165, 116, 0.5)";
                      e.target.style.boxShadow = "0 0 0 3px rgba(212, 165, 116, 0.12)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(255, 255, 255, 0.08)";
                      e.target.style.boxShadow = "none";
                    }}
                    placeholder="Mínimo 6 caracteres"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "8px" }}>
                  Confirmar contraseña
                </label>
                <div style={{ position: "relative" }}>
                  <i className="bi bi-lock-fill" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#d4a574" }} />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 16px 12px 42px",
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "14px",
                      color: "#f0f0f5",
                      fontSize: "14px",
                      fontWeight: 500,
                      outline: "none",
                      transition: "all 0.2s",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "rgba(212, 165, 116, 0.5)";
                      e.target.style.boxShadow = "0 0 0 3px rgba(212, 165, 116, 0.12)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(255, 255, 255, 0.08)";
                      e.target.style.boxShadow = "none";
                    }}
                    placeholder="Repite la contraseña"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg, #d4a574 0%, #b08a5f 100%)",
                  color: "#FFFFFF",
                  fontWeight: 700,
                  padding: "14px",
                  borderRadius: "9999px",
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  boxShadow: "0 4px 20px rgba(212, 165, 116, 0.25)",
                  transition: "all 0.2s",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Actualizando..." : "Actualizar contraseña"}
              </button>
            </form>
          )}

          {!success && (
            <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid rgba(255, 255, 255, 0.08)", textAlign: "center" }}>
              <Link href="/dashboard/login" style={{ fontSize: "14px", fontWeight: 600, color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>
                ← Volver al inicio de sesión
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
