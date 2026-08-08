"use client";

import { useEffect, useRef } from "react";
import { getTurnstileSiteKey } from "@/lib/turnstile";

const TURNSTILE_SCRIPT_ID = "cf-turnstile-script";
let turnstileScriptPromise = null;

function loadTurnstileScript() {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (turnstileScriptPromise) return turnstileScriptPromise;

  turnstileScriptPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(TURNSTILE_SCRIPT_ID);
    if (existing) {
      existing.addEventListener("load", () => resolve(window.turnstile), { once: true });
      existing.addEventListener("error", reject, { once: true });
      return;
    }
    const script = document.createElement("script");
    script.id = TURNSTILE_SCRIPT_ID;
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.turnstile);
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return turnstileScriptPromise;
}

export default function TurnstileWidget({ onTokenChange, theme = "auto", resetKey = 0 }) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const siteKey = getTurnstileSiteKey();

  useEffect(() => {
    if (!siteKey || !containerRef.current) return undefined;
    let cancelled = false;
    loadTurnstileScript().then((turnstile) => {
      if (cancelled || !turnstile || !containerRef.current) return;
      containerRef.current.innerHTML = "";
      widgetIdRef.current = turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme,
        callback: (token) => onTokenChange(token),
        "expired-callback": () => onTokenChange(""),
        "error-callback": () => onTokenChange(""),
      });
    }).catch(() => onTokenChange(""));

    return () => {
      cancelled = true;
      if (typeof window !== "undefined" && window.turnstile && widgetIdRef.current !== null) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, theme, resetKey, onTokenChange]);

  if (!siteKey) return null;
  return <div ref={containerRef} />;
}
