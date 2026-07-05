"use client";

import { useEffect, useState } from "react";
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

        const user = session.user;
        const fullName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "Ejecutiva Mundo";

        setStatus("Creando tu landing...");

        const res = await fetch("/api/sellers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: fullName,
            email: user.email || "",
            photo: user.user_metadata?.avatar_url || user.user_metadata?.picture || "",
          }),
        });

        const data = await res.json();

        if (!res.ok && data.error !== "Unauthorized" && data.error !== "Forbidden") {
          setStatus("Error al crear perfil: " + (data.error || ""));
          setTimeout(() => router.push("/registro"), 3000);
          return;
        }

        if (data.slug) {
          setStatus("Redirigiendo a tu landing...");
          router.push(`/p/${data.slug}`);
        } else if (data.error) {
          const existing = await fetch(`/api/sellers?slug=${slugify(fullName)}`);
          if (existing.ok) {
            const seller = await existing.json();
            router.push(`/p/${seller.slug}`);
          } else {
            router.push("/dashboard");
          }
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