"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export default function AuthCallback() {
  const [status, setStatus] = useState("Autenticando...");
  const router = useRouter();
  const supabase = useMemo(
    () => createClient({ auth: { detectSessionInUrl: false } }),
    []
  );

  const hardRedirect = useCallback((path) => {
    const target = `${window.location.origin}${path}`;
    if (typeof window !== "undefined") {
      window.location.replace(target);
      return;
    }
    router.replace(target);
  }, [router]);

  useEffect(() => {
    async function handleCallback() {
      try {
        const callbackParams = new URLSearchParams(window.location.search);
        const oauthError = callbackParams.get("error_description") || callbackParams.get("error");
        if (oauthError) {
          setStatus("Google no pudo autenticar la cuenta");
          setTimeout(() => hardRedirect("/dashboard/login?oauthError=" + encodeURIComponent(oauthError)), 1200);
          return;
        }

        const code = callbackParams.get("code");
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        }

        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) {
          setStatus("Error: no se pudo obtener la sesión");
          setTimeout(() => hardRedirect("/dashboard"), 1200);
          return;
        }

        setStatus("Preparando tu perfil...");

        const companySlug = session.user?.user_metadata?.company;

        const res = await fetch(`/api/me/seller${companySlug ? `?company=${encodeURIComponent(companySlug)}` : ""}`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setStatus("Error al preparar perfil: " + (data.error || ""));
          setTimeout(() => hardRedirect("/dashboard"), 1200);
          return;
        }

        const seller = await res.json();

        // Si el usuario viene de OAuth y le faltan datos → completar en el registro
        const isOAuthUser = session.user.app_metadata?.provider === "google" ||
                            session.user.app_metadata?.provider === "facebook";
        const needsProfile = !seller.phone || !seller.companyId;

        if (isOAuthUser && needsProfile) {
          setStatus("Completa tus datos...");
          hardRedirect("/registro?oauth=true");
        } else {
          setStatus("Redirigiendo al dashboard...");
          hardRedirect("/dashboard");
        }
      } catch (e) {
        setStatus("Error: " + e.message);
        setTimeout(() => hardRedirect("/dashboard"), 1200);
      }
    }
    handleCallback();
  }, [hardRedirect, supabase]);

  return (
    <div
      style={{
        minHeight: "100vh",
         background: "linear-gradient(135deg, #0b0f14 0%, #1b3157 100%)",
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
           borderTop: "4px solid #72a6ff",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
      <p style={{ fontSize: "16px", fontWeight: 600 }}>{status}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
