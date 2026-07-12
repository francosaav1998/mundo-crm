"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
        router.push("/dashboard");
        router.refresh();
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
      }}
    >
      {/* EducMark Aurora Background */}
      <div
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
        {/* Logo and title */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
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
            <i className="bi bi-globe-americas" style={{ color: "#fff", fontSize: "28px" }} />
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.02em", fontFamily: "var(--font-heading), 'Outfit', sans-serif" }}>CRM Mundo</h1>
          <p style={{ color: "rgba(240, 240, 245, 0.65)", fontSize: "14px", marginTop: "6px", fontWeight: 500 }}>Acceso ejecutivos de ventas</p>
        </div>

        {/* Card Login */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            borderRadius: "24px",
            padding: "36px",
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

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              style={{
                width: "100%",
                background: "rgba(128, 128, 255, 0.12)",
                color: "#8080ff",
                fontWeight: 700,
                padding: "14px",
                borderRadius: "9999px",
                border: "1px solid rgba(128, 128, 255, 0.35)",
                cursor: "pointer",
                fontSize: "14px",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                marginBottom: "4px",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(128, 128, 255, 0.18)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "rgba(128, 128, 255, 0.12)"}
            >
              <i className="bi bi-person-badge-fill" />
              Entrar como invitado
            </button>

            <div style={{ position: "relative", textAlign: "center", margin: "4px 0" }}>
              <div style={{ position: "absolute", inset: "50% 0 0 0", height: "1px", background: "rgba(255,255,255,0.08)" }} />
              <span style={{ position: "relative", background: "rgba(255,255,255,0.03)", padding: "0 12px", fontSize: "12px", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>o</span>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "8px" }}>
                Usuario
              </label>
              <div style={{ position: "relative" }}>
                <i className="bi bi-person-fill" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#d4a574" }} />
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
                    e.target.style.borderColor = "rgba(212, 165, 116, 0.5)";
                    e.target.style.boxShadow = "0 0 0 3px rgba(212, 165, 116, 0.12)";
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
                background: "linear-gradient(135deg, #d4a574 0%, #b08a5f 100%)",
                color: "#FFFFFF",
                fontWeight: 700,
                padding: "14px",
                borderRadius: "9999px",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                boxShadow: "0 4px 20px rgba(212, 165, 116, 0.25)",
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
          </form>

          <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid rgba(255, 255, 255, 0.08)", textAlign: "center" }}>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginBottom: "12px" }}>
              ¿Eres ejecutiva y no tienes cuenta?
            </p>
            <Link href="/registro" style={{ fontSize: "14px", fontWeight: 600, color: "#d4a574", textDecoration: "none", display: "block", marginBottom: "12px" }}>
              Regístrate aqui →
            </Link>
            <Link href="/" style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>
              ← Volver a la landing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
