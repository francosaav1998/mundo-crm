"use client";

import { useState } from "react";

const EDITOR_OUTLINE = "#2563EB";

export default function PreviewWrapper({ id, label, active, children }) {
  const [hovered, setHovered] = useState(false);
  const showOutline = active || hovered;

  return (
    <div
      data-preview-section={id}
      style={{ position: "relative" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClickCapture={(e) => {
        if (e.target.closest("[data-edit]")) return;
        e.preventDefault();
        e.stopPropagation();
        window.parent?.postMessage(
          { type: "LANDING_PREVIEW_SECTION_SELECTED", sectionId: id },
          window.location.origin
        );
      }}
    >
      {children}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 9999,
          pointerEvents: "none",
          boxShadow: showOutline
            ? active
              ? `inset 0 0 0 3px ${EDITOR_OUTLINE}, 0 0 0 1px rgba(37,99,235,0.35)`
              : `inset 0 0 0 2px ${EDITOR_OUTLINE}`
            : "none",
          background: showOutline ? "rgba(37,99,235,0.03)" : "transparent",
          transition: "all 0.15s ease",
        }}
      />
      {showOutline && (
        <div
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            zIndex: 9999,
            background: EDITOR_OUTLINE,
            color: "#fff",
            fontSize: 11,
            fontWeight: 800,
            padding: "4px 10px",
            borderRadius: 6,
            boxShadow: "0 4px 12px rgba(37,99,235,0.35)",
            pointerEvents: "none",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}
