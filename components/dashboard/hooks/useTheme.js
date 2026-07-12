"use client";

import { useSyncExternalStore, useCallback } from "react";

function getInitialTheme(storageKey) {
  if (typeof window === "undefined") return "dark";
  return localStorage.getItem(storageKey) || "dark";
}

function subscribe(storageKey, callback) {
  const handler = (e) => {
    if (e.key === storageKey) callback();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

function getSnapshot(storageKey) {
  if (typeof window === "undefined") return "dark";
  return localStorage.getItem(storageKey) || "dark";
}

function getServerSnapshot() {
  return "dark";
}

export function useTheme(storageKey = "theme") {
  const theme = useSyncExternalStore(
    (cb) => subscribe(storageKey, cb),
    () => getSnapshot(storageKey),
    getServerSnapshot
  );

  const setTheme = useCallback((t) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, t);
    }
    document.documentElement.setAttribute("data-theme", t);
    window.dispatchEvent(new StorageEvent("storage", { key: storageKey, newValue: t }));
  }, [storageKey]);

  const toggle = useCallback(() => setTheme(theme === "dark" ? "light" : "dark"), [theme, setTheme]);

  return { theme, setTheme, toggle };
}
