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
      {/* Soft glow accents matching landing */}
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

      <div style={{ width: "100%", height: "100%", maxWidth: "420px", zIndex: 1 }}>
        {/* Logo and title */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
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
          <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.02em" }}>CRM Mundo</h1>
          <p style={{ color: "rgba(248, 250, 252, 0.85)", fontSize: "14px", marginTop: "6px" }}>Acceso ejecutivos de ventas</p>
        </div>

        {/* Card Login */}
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
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#1E293B", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                Usuario
              </label>
              <div style={{ position: "relative" }}>
                <i className="bi bi-person-fill" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#00748E" }} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px 12px 42px",
                    background: "#F8FAFC",
                    border: "2px solid #E2E8F0",
                    borderRadius: "12px",
                    color: "#1E293B",
                    fontSize: "14px",
                    fontWeight: 600,
                    outline: "none",
                    transition: "all 0.2s",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#00748E";
                    e.target.style.boxShadow = "0 0 0 4px rgba(0, 116, 142, 0.15)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#E2E8F0";
                    e.target.style.boxShadow = "none";
                  }}
                  placeholder="Ingresa tu usuario"
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#1E293B", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                Contraseña
              </label>
              <div style={{ position: "relative" }}>
                <i className="bi bi-lock-fill" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#00748E" }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px 12px 42px",
                    background: "#F8FAFC",
                    border: "2px solid #E2E8F0",
                    borderRadius: "12px",
                    color: "#1E293B",
                    fontSize: "14px",
                    fontWeight: 600,
                    outline: "none",
                    transition: "all 0.2s",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#00748E";
                    e.target.style.boxShadow = "0 0 0 4px rgba(0, 116, 142, 0.15)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#E2E8F0";
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
                background: "linear-gradient(135deg, #00748E 0%, #005A6F 100%)",
                color: "#FFFFFF",
                fontWeight: 800,
                padding: "14px",
                borderRadius: "12px",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                boxShadow: "0 4px 20px rgba(0, 116, 142, 0.35)",
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

          <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #E2E8F0", textAlign: "center" }}>
            <Link href="/" style={{ fontSize: "13px", fontWeight: 700, color: "#00748E", textDecoration: "none" }}>
              ← Volver a la landing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
