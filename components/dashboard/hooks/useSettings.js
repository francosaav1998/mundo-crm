"use client";

import { useCallback, useEffect, useState } from "react";
import { normalizeWhatsAppNumber } from "@/lib/seller";

const STORAGE_KEYS = [
  "seller_name",
  "seller_phone",
  "seller_msg",
  "seller_photo",
  "seller_bio",
  "landing_theme",
  "footer_text",
  "whatsapp_number",
  "meta_pixel_id",
  "bg_video_url",
  "crm_email_use_smtp",
];

const DEFAULT_SETTINGS = {
  sellerName: "Ejecutiva Mundo",
  sellerPhone: "",
  sellerMsg: "Hola, vi tu página web y me gustaría recibir asesoría sobre los planes de Internet y TV Hogar de Mundo.",
  sellerPhoto: "",
  sellerBio: "Como tu ejecutiva comercial especializada de Mundo, te ayudo a gestionar tu contrato de forma rápida y transparente.",
  landingTheme: "light",
  footerText: "Tu ejecutiva comercial autorizada de Mundo. Gestión ágil, directa y transparente de tus planes de internet fibra, televisión digital y telefonía móvil.",
  whatsappNumber: "",
  metaPixelId: "",
  bgVideoUrl: "",
  emailUseSmtp: false,
};

export function useSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const loadFromLocalStorage = useCallback(() => {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;
    return {
      sellerName: localStorage.getItem("seller_name") || DEFAULT_SETTINGS.sellerName,
      sellerPhone: localStorage.getItem("seller_phone") || DEFAULT_SETTINGS.sellerPhone,
      sellerMsg: localStorage.getItem("seller_msg") || DEFAULT_SETTINGS.sellerMsg,
      sellerPhoto: localStorage.getItem("seller_photo") || DEFAULT_SETTINGS.sellerPhoto,
      sellerBio: localStorage.getItem("seller_bio") || DEFAULT_SETTINGS.sellerBio,
      landingTheme: localStorage.getItem("landing_theme") || DEFAULT_SETTINGS.landingTheme,
      footerText: localStorage.getItem("footer_text") || DEFAULT_SETTINGS.footerText,
      whatsappNumber: normalizeWhatsAppNumber(localStorage.getItem("whatsapp_number") || DEFAULT_SETTINGS.whatsappNumber),
      metaPixelId: localStorage.getItem("meta_pixel_id") || DEFAULT_SETTINGS.metaPixelId,
      bgVideoUrl: localStorage.getItem("bg_video_url") || DEFAULT_SETTINGS.bgVideoUrl,
      emailUseSmtp: localStorage.getItem("crm_email_use_smtp") === "1",
    };
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/settings");
        if (!res.ok) throw new Error("Failed to load settings");
        const data = await res.json();

        setSettings({
          sellerName: data.seller_name || DEFAULT_SETTINGS.sellerName,
          sellerPhone: data.seller_phone || DEFAULT_SETTINGS.sellerPhone,
          sellerMsg: data.seller_msg || DEFAULT_SETTINGS.sellerMsg,
          sellerPhoto: data.seller_photo || DEFAULT_SETTINGS.sellerPhoto,
          sellerBio: data.seller_bio || DEFAULT_SETTINGS.sellerBio,
          landingTheme: data.landing_theme || DEFAULT_SETTINGS.landingTheme,
          footerText: data.footer_text !== undefined ? data.footer_text : DEFAULT_SETTINGS.footerText,
          whatsappNumber: normalizeWhatsAppNumber(data.whatsapp_number || DEFAULT_SETTINGS.whatsappNumber),
          metaPixelId: data.meta_pixel_id !== undefined ? data.meta_pixel_id : DEFAULT_SETTINGS.metaPixelId,
          bgVideoUrl: data.bg_video_url !== undefined ? data.bg_video_url : DEFAULT_SETTINGS.bgVideoUrl,
          emailUseSmtp: data.crm_email_use_smtp === "1" || data.crm_email_use_smtp === true,
        });
      } catch {
        setSettings(loadFromLocalStorage());
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [loadFromLocalStorage]);

  const updateSettings = useCallback((updates) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const saveSettings = useCallback(async (settingsToSave) => {
    const normalizedWhatsapp = normalizeWhatsAppNumber(settingsToSave.whatsappNumber);
    const payload = {
      seller_name: settingsToSave.sellerName,
      seller_phone: settingsToSave.sellerPhone,
      seller_msg: settingsToSave.sellerMsg,
      seller_bio: settingsToSave.sellerBio,
      seller_photo: settingsToSave.sellerPhoto ? settingsToSave.sellerPhoto.trim() : "",
      landing_theme: settingsToSave.landingTheme,
      footer_text: settingsToSave.footerText,
      whatsapp_number: normalizedWhatsapp,
      meta_pixel_id: settingsToSave.metaPixelId.trim(),
      bg_video_url: settingsToSave.bgVideoUrl.trim(),
      crm_email_use_smtp: settingsToSave.emailUseSmtp ? "1" : "0",
    };

    if (typeof window !== "undefined") {
      Object.entries(payload).forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });
      document.documentElement.setAttribute("data-landing-theme", settingsToSave.landingTheme);
    }

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Error al guardar en el servidor");
      showToast("Configuración guardada exitosamente");
      return true;
    } catch (error) {
      showToast(error.message || "Error al guardar");
      return false;
    }
  }, [showToast]);

  return { settings, loading, toast, updateSettings, saveSettings, showToast };
}
