"use client";

import { useEffect, useState } from "react";

export function useTheme(storageKey = "theme") {
  const [theme, setThemeState] = useState(() => {
    if (typeof window === "undefined") return "light";
    return localStorage.getItem(storageKey) || "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const setTheme = (t) => {
    setThemeState(t);
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, t);
    }
    document.documentElement.setAttribute("data-theme", t);
  };

  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");

  return { theme, setTheme, toggle };
}
