"use client";

import { useEffect } from "react";

export default function PreviewEditBootstrap() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const style = document.createElement("style");
    style.textContent = `
      [data-edit] {
        cursor: text;
        outline: none;
        border-radius: 4px;
        transition: background 0.2s;
      }
      [data-edit]:hover {
        background: rgba(37, 99, 235, 0.10);
      }
      [data-edit]:focus {
        background: rgba(37, 99, 235, 0.15);
        box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.4);
      }
      a, button {
        pointer-events: none !important;
      }
      [data-edit] {
        pointer-events: auto !important;
      }
    `;
    document.head.appendChild(style);

    const originalValues = new Map();

    const handleFocus = (e) => {
      const el = e.target;
      if (!el.dataset.edit) return;
      originalValues.set(el, el.innerText);
    };

    const handleBlur = (e) => {
      const el = e.target;
      if (!el.dataset.edit) return;
      const path = el.dataset.edit;
      const value = el.innerText;
      const original = originalValues.get(el);
      if (value !== original) {
        window.parent?.postMessage(
          { type: "LANDING_PREVIEW_TEXT_EDIT", payload: { path, value } },
          window.location.origin
        );
      }
    };

    const handleKeyDown = (e) => {
      const el = e.target;
      if (!el.dataset.edit) return;
      if (e.key === "Escape") {
        e.preventDefault();
        el.innerText = originalValues.get(el) || "";
        el.blur();
        return;
      }
      if (e.key === "Enter" && el.dataset.editMultiline !== "true") {
        e.preventDefault();
        el.blur();
      }
    };

    const elements = Array.from(document.querySelectorAll("[data-edit]"));
    elements.forEach((el) => {
      el.contentEditable = "true";
      el.addEventListener("focus", handleFocus);
      el.addEventListener("blur", handleBlur);
      el.addEventListener("keydown", handleKeyDown);
    });

    return () => {
      elements.forEach((el) => {
        el.contentEditable = "false";
        el.removeEventListener("focus", handleFocus);
        el.removeEventListener("blur", handleBlur);
        el.removeEventListener("keydown", handleKeyDown);
      });
      style.remove();
    };
  }, []);

  return null;
}
