"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

function slugify(text) {
  return String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase()
    .slice(0, 60);
}

export default function RegistroPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setLoading(false);
      return;
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
        },
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        const slug = slugify(name);
        const res = await fetch("/api/sellers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            phone,
            slug,
          }),
        });

        if (res.ok) {
          const seller = await res.json();
          setSuccess(true);
          setTimeout(() => router.push(`/p/${seller.slug}`), 1500);
          return;
        }

        setSuccess(true);
        setTimeout(() => router.push("/dashboard/login"), 2000);
      }
    } catch (err) {
      setError(err.message || "Error al registrarse");
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
              }}
            >
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
              ¡Cuenta creada! Redirigiendo a tu landing...
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#1E293B", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
                Nombre completo *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="María González"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "#F8FAFC",
                  border: "2px solid #E2E8F0",
                  borderRadius: "12px",
                  color: "#1E293B",
                  fontSize: "14px",
                  fontWeight: 600,
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#1E293B", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
                Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="maria@gmail.com"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "#F8FAFC",
                  border: "2px solid #E2E8F0",
                  borderRadius: "12px",
                  color: "#1E293B",
                  fontSize: "14px",
                  fontWeight: 600,
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#1E293B", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
                WhatsApp
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+56912345678"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "#F8FAFC",
                  border: "2px solid #E2E8F0",
                  borderRadius: "12px",
                  color: "#1E293B",
                  fontSize: "14px",
                  fontWeight: 600,
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#1E293B", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
                Contraseña *
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Mínimo 6 caracteres"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "#F8FAFC",
                  border: "2px solid #E2E8F0",
                  borderRadius: "12px",
                  color: "#1E293B",
                  fontSize: "14px",
                  fontWeight: 600,
                  outline: "none",
                }}
              />
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
                marginTop: "8px",
              }}
            >
              {loading ? "Creando cuenta..." : "Crear mi cuenta"}
            </button>
          </form>

          <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #E2E8F0", textAlign: "center" }}>
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
              Iniciar sesión →
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