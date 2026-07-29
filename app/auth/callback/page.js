"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export default function AuthCallback() {
  const [status, setStatus] = useState("Autenticando...");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function handleCallback() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) {
          setStatus("Error: no se pudo obtener la sesión");
          setTimeout(() => router.push("/registro"), 2000);
          return;
        }

        setStatus("Preparando tu perfil...");

        const companySlug = session.user?.user_metadata?.company;

        const res = await fetch(`/api/me/seller${companySlug ? `?company=${encodeURIComponent(companySlug)}` : ""}`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setStatus("Error al preparar perfil: " + (data.error || ""));
          setTimeout(() => router.push("/registro"), 3000);
          return;
        }

        const seller = await res.json();

        // Si el usuario viene de OAuth y le faltan datos → completar en el registro
        const isOAuthUser = session.user.app_metadata?.provider === "google" ||
                            session.user.app_metadata?.provider === "facebook";
        const needsProfile = !seller.phone || !seller.companyId;

        if (isOAuthUser && needsProfile) {
          setStatus("Completa tus datos...");
          router.push("/registro?oauth=true");
        } else {
          setStatus("Redirigiendo al dashboard...");
          router.push("/dashboard");
        }
      } catch (e) {
        setStatus("Error: " + e.message);
        setTimeout(() => router.push("/registro"), 3000);
      }
    }
    handleCallback();
  }, [router, supabase]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #005A6F 0%, #00748E 100%)",
        color: "#F8FAFC",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Montserrat', sans-serif",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          border: "4px solid rgba(255,255,255,0.2)",
          borderTop: "4px solid #FDDC02",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
      <p style={{ fontSize: "16px", fontWeight: 600 }}>{status}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
