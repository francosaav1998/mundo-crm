"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

export default function RecuperarPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/actualizar-password`,
      });
      if (err) throw err;
      setSent(true);
    } catch (err) {
      setError(err.message || "Error al enviar el correo");
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
        position: "relative",
        overflow: "hidden",
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: `
            radial-gradient(ellipse 80% 50% at 50% -10%, rgba(212, 165, 116, 0.14), transparent 60%),
            radial-gradient(circle at 120% 20%, rgba(128, 128, 255, 0.1), transparent 45%),
            radial-gradient(circle at -10% 80%, rgba(212, 165, 116, 0.08), transparent 40%)
          `,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div style={{ width: "100%", maxWidth: "420px", zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: "center", marginBottom: "32px" }}
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            style={{
              width: "64px",
              height: "64px",
              background: "linear-gradient(135deg, #d4a574 0%, #8080ff 100%)",
              borderRadius: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
            }}
          >
            <i className="bi bi-key" style={{ color: "#fff", fontSize: "28px" }} />
          </motion.div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.02em", fontFamily: "var(--font-heading), 'Outfit', sans-serif" }}>
            Recuperar contraseña
          </h1>
          <p style={{ color: "rgba(240, 240, 245, 0.65)", fontSize: "14px", marginTop: "6px", fontWeight: 500 }}>
            Te enviaremos un link para restablecer tu contraseña
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            borderRadius: "24px",
            padding: "clamp(24px, 4vw, 36px)",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.25)",
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
                borderRadius: "14px",
                fontSize: "13px",
                fontWeight: 600,
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

          {sent ? (
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  background: "rgba(37, 211, 102, 0.1)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                }}
              >
                <i className="bi bi-check-lg" style={{ color: "#25D366", fontSize: "28px" }} />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>Correo enviado</h3>
              <p style={{ fontSize: "14px", color: "rgba(240, 240, 245, 0.65)", lineHeight: 1.6, marginBottom: "24px" }}>
                Si existe una cuenta con <strong>{email}</strong>, recibirás un link para restablecer tu contraseña.
              </p>
              <Link
                href="/dashboard/login"
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#d4a574",
                  textDecoration: "none",
                }}
              >
                ← Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "8px" }}>
                  Correo electrónico
                </label>
                <div style={{ position: "relative" }}>
                  <i className="bi bi-envelope-fill" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#d4a574" }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    placeholder="tu@correo.com"
                    required
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
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Enviando..." : "Enviar link de recuperación"}
              </button>
            </form>
          )}

          {!sent && (
            <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid rgba(255, 255, 255, 0.08)", textAlign: "center" }}>
              <Link
                href="/dashboard/login"
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.5)",
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#d4a574"}
                onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255, 255, 255, 0.5)"}
              >
                ← Volver al inicio de sesión
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
