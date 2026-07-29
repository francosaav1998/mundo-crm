"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  const hardRedirect = (path) => {
    const target = `${window.location.origin}${path}`;
    window.location.assign(target);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al iniciar sesión");
      } else {
        hardRedirect("/dashboard");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

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
      {/* EducMark Aurora Background */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: `
            radial-gradient(ellipse 80% 50% at 50% -10%, rgba(79, 140, 255, 0.18), transparent 60%),
            radial-gradient(circle at 120% 20%, rgba(114, 166, 255, 0.12), transparent 45%),
            radial-gradient(circle at -10% 80%, rgba(37, 99, 235, 0.1), transparent 40%)
          `,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div style={{ width: "100%", maxWidth: "420px", zIndex: 1 }}>
        {/* Logo and title */}
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
               background: "linear-gradient(135deg, #4f8cff 0%, #72a6ff 100%)",
              borderRadius: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
            }}
          >
            <i className="bi bi-globe-americas" style={{ color: "#fff", fontSize: "28px" }} />
          </motion.div>
           <h1 style={{ fontSize: "clamp(24px, 7vw, 28px)", fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.02em", fontFamily: "var(--font-heading), 'Outfit', sans-serif" }}>GestionVendedores.com</h1>
          <p style={{ color: "rgba(240, 240, 245, 0.65)", fontSize: "14px", marginTop: "6px", fontWeight: 500 }}>Acceso ejecutivos de ventas</p>
        </motion.div>

        {/* Card Login */}
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
                marginBottom: "24px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <i className="bi bi-exclamation-triangle-fill"></i>
              {error}
            </div>
          )}

          {/* Botón Google OAuth */}
          <button
            onClick={async () => {
              setOauthLoading(true);
              setError("");
              try {
                const { error: err } = await supabase.auth.signInWithOAuth({
                  provider: "google",
           options: { redirectTo: `${window.location.origin}/auth/callback?from=login` },
                });
                if (err) setError(err.message);
              } catch (e) {
                setError(e.message);
              } finally {
                setOauthLoading(false);
              }
            }}
            disabled={oauthLoading || loading}
            style={{
              width: "100%",
              background: "rgba(255, 255, 255, 0.04)",
              color: "#f0f0f5",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              fontWeight: 700,
              padding: "12px",
              borderRadius: "14px",
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
                   e.target.style.borderColor = "rgba(79, 140, 255, 0.6)";
                   e.target.style.boxShadow = "0 0 0 3px rgba(79, 140, 255, 0.14)";
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = "rgba(255, 255, 255, 0.08)";
              e.target.style.boxShadow = "none";
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {oauthLoading ? "Conectando..." : "Iniciar sesión con Google"}
          </button>

          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(255, 255, 255, 0.08)" }} />
            <span style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.4)", fontWeight: 600, whiteSpace: "nowrap" }}>
              O continúa con email
            </span>
            <div style={{ flex: 1, height: "1px", background: "rgba(255, 255, 255, 0.08)" }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "8px" }}>
                Usuario
              </label>
              <div style={{ position: "relative" }}>
                 <i className="bi bi-person-fill" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#72a6ff" }} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
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
                   e.target.style.borderColor = "rgba(79, 140, 255, 0.6)";
                   e.target.style.boxShadow = "0 0 0 3px rgba(79, 140, 255, 0.14)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(255, 255, 255, 0.08)";
                    e.target.style.boxShadow = "none";
                  }}
                  placeholder="Ingresa tu usuario"
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "8px" }}>
                Contraseña
              </label>
              <div style={{ position: "relative" }}>
                 <i className="bi bi-lock-fill" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#72a6ff" }} />
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
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                 background: "linear-gradient(135deg, #4f8cff 0%, #2563eb 100%)",
                color: "#FFFFFF",
                fontWeight: 700,
                padding: "14px",
                borderRadius: "9999px",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                 boxShadow: "0 4px 20px rgba(79, 140, 255, 0.28)",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-1px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              {loading ? "Ingresando..." : "Ingresar al Dashboard"}
            </button>

            <Link href="/auth/recuperar" style={{
              fontSize: "13px",
              color: "rgba(255, 255, 255, 0.5)",
              fontWeight: 500,
              textDecoration: "none",
              textAlign: "center",
              display: "block",
              transition: "color 0.2s",
            }}
               onMouseEnter={(e) => e.currentTarget.style.color = "#72a6ff"}
              onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255, 255, 255, 0.5)"}>
              ¿Olvidaste tu contraseña?
            </Link>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.4 }}
            style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid rgba(255, 255, 255, 0.08)", textAlign: "center" }}
          >
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginBottom: "12px" }}>
              ¿Eres ejecutiva y no tienes cuenta?
            </p>
             <Link href="/registro" style={{ fontSize: "14px", fontWeight: 600, color: "#72a6ff", textDecoration: "none", display: "block", marginBottom: "12px" }}>
              Regístrate aqui →
            </Link>
            <Link href="/" style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>
              ← Volver a la landing
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
