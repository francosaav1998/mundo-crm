"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export default function RegistroPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function handleGoogleLogin() {
    setLoading(true);
    setError("");
    try {
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (err) setError(err.message);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleFacebookLogin() {
    setLoading(true);
    setError("");
    try {
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: "facebook",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (err) setError(err.message);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

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
        position: "relative",
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

      <div style={{ width: "100%", maxWidth: "440px", zIndex: 1, textAlign: "center" }}>
        <div style={{ marginBottom: "32px" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              background: "#FFFFFF",
              borderRadius: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
            }}
          >
            <span style={{ color: "#00748E", fontWeight: 900, fontSize: "26px" }}>M</span>
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: 800, letterSpacing: "-0.02em" }}>
            Únete como Ejecutiva Mundo
          </h1>
          <p style={{ color: "rgba(248, 250, 252, 0.85)", fontSize: "14px", marginTop: "6px" }}>
            Regístrate y obtén tu propia landing personalizada para vender
          </p>
        </div>

        <div
          style={{
            background: "#FFFFFF",
            borderRadius: "24px",
            padding: "36px",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.25)",
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
              }}
            >
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            style={{
              width: "100%",
              background: "#FFFFFF",
              color: "#1E293B",
              border: "2px solid #E2E8F0",
              fontWeight: 700,
              padding: "14px",
              borderRadius: "12px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              marginBottom: "14px",
              transition: "all 0.2s",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? "Conectando..." : "Registrarse con Google"}
          </button>

          <button
            onClick={handleFacebookLogin}
            disabled={loading}
            style={{
              width: "100%",
              background: "#1877F2",
              color: "#FFFFFF",
              border: "none",
              fontWeight: 700,
              padding: "14px",
              borderRadius: "12px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              marginBottom: "14px",
              transition: "all 0.2s",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            {loading ? "Conectando..." : "Registrarse con Facebook"}
          </button>

          <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #E2E8F0", textAlign: "center" }}>
            <p style={{ fontSize: "13px", color: "#64748B", marginBottom: "8px" }}>
              ¿Ya tienes cuenta?
            </p>
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
              Iniciar sesión
            </button>
          </div>
        </div>

        <p style={{ fontSize: "12px", color: "rgba(248, 250, 252, 0.6)", marginTop: "20px" }}>
          Al registrarte, aceptas nuestra{" "}
          <a href="/politica-de-privacidad" style={{ color: "rgba(248, 250, 252, 0.8)" }}>
            Política de Privacidad
          </a>
        </p>
      </div>
    </div>
  );
}