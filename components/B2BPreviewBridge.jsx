"use client";

import { useEffect, useState } from "react";
import B2BLandingPage from "./B2BLandingPage";

// Puente de vista previa para el editor B2B: renderiza la portada con el
// contenido guardado y escucha actualizaciones en vivo por postMessage.
export default function B2BPreviewBridge({ initialContent }) {
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data;
      if (!data || typeof data !== "object") return;
      if (data.type === "B2B_PREVIEW_UPDATE" && data.content) {
        setContent(data.content);
      }
    };

    // Los links no deben navegar dentro del iframe del editor.
    const blockNavigation = (event) => {
      if (event.target.closest("a")) event.preventDefault();
    };

    window.addEventListener("message", handleMessage);
    document.addEventListener("click", blockNavigation);
    window.parent?.postMessage({ type: "B2B_PREVIEW_READY" }, window.location.origin);

    return () => {
      window.removeEventListener("message", handleMessage);
      document.removeEventListener("click", blockNavigation);
    };
  }, []);

  return <B2BLandingPage content={content} isPreview />;
}
