"use client";

import { useCallback, useEffect, useState } from "react";
import { normalizeWhatsAppNumber } from "@/lib/seller";

const LOCAL_KEYS = ["seller_msg"];

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
  sellerGender: "",
  landingTheme: "light",
  footerText: "Tu ejecutiva comercial autorizada de Mundo. Gestión ágil, directa y transparente de tus planes de internet fibra, televisión digital y telefonía móvil.",
  whatsappNumber: "",
  metaPixelId: "",
  bgVideoUrl: "",
  emailUseSmtp: false,
};

function sellerToSettings(seller) {
  if (!seller) return {};
  return {
    sellerName: seller.name || DEFAULT_SETTINGS.sellerName,
    sellerPhone: seller.phone || DEFAULT_SETTINGS.sellerPhone,
    sellerPhoto: seller.photo || DEFAULT_SETTINGS.sellerPhoto,
    sellerBio: seller.bio || DEFAULT_SETTINGS.sellerBio,
    sellerGender: seller.gender || "",
    landingTheme: seller.landingTheme || DEFAULT_SETTINGS.landingTheme,
    footerText: seller.footerText || DEFAULT_SETTINGS.footerText,
    whatsappNumber: normalizeWhatsAppNumber(seller.phone || ""),
    metaPixelId: seller.metaPixelId || DEFAULT_SETTINGS.metaPixelId,
    bgVideoUrl: seller.bgVideoUrl || DEFAULT_SETTINGS.bgVideoUrl,
    sellerMsg: seller.defaultMessage || DEFAULT_SETTINGS.sellerMsg,
  };
}

function settingsToSellerPayload(settings) {
  // Los datos de perfil (nombre, foto, bio, etc.) se editan desde el Editor de Landing.
  // Desde Configuración el vendedor solo edita su mensaje inicial por defecto.
  return {
    defaultMessage: settings.sellerMsg,
  };
}

function settingsToGlobalPayload(settings) {
  return {
    seller_name: settings.sellerName,
    seller_phone: normalizeWhatsAppNumber(settings.sellerPhone),
    seller_msg: settings.sellerMsg,
    seller_bio: settings.sellerBio,
    seller_photo: settings.sellerPhoto ? settings.sellerPhoto.trim() : "",
    landing_theme: settings.landingTheme,
    footer_text: settings.footerText,
    whatsapp_number: normalizeWhatsAppNumber(settings.whatsappNumber),
    meta_pixel_id: settings.metaPixelId.trim(),
    bg_video_url: settings.bgVideoUrl.trim(),
    crm_email_use_smtp: settings.emailUseSmtp ? "1" : "0",
  };
}

export function useSettings({ isAdmin = false } = {}) {
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
      footerText: localStorage.getItem("footer_text") !== null ? localStorage.getItem("footer_text") : DEFAULT_SETTINGS.footerText,
      whatsappNumber: normalizeWhatsAppNumber(localStorage.getItem("whatsapp_number") || DEFAULT_SETTINGS.whatsappNumber),
      metaPixelId: localStorage.getItem("meta_pixel_id") || DEFAULT_SETTINGS.metaPixelId,
      bgVideoUrl: localStorage.getItem("bg_video_url") || DEFAULT_SETTINGS.bgVideoUrl,
      emailUseSmtp: localStorage.getItem("crm_email_use_smtp") === "1",
      defaultMessage: localStorage.getItem("seller_msg") || DEFAULT_SETTINGS.sellerMsg,
    };
  }, []);

  useEffect(() => {
    async function load() {
      try {
        if (isAdmin) {
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
            defaultMessage: data.seller_msg || DEFAULT_SETTINGS.sellerMsg,
          });
        } else {
          const res = await fetch("/api/me/seller");
          if (!res.ok) throw new Error("Failed to load seller");
          const seller = await res.json();
          const local = loadFromLocalStorage();
          setSettings({
            ...DEFAULT_SETTINGS,
            ...local,
            ...sellerToSettings(seller),
          });
        }
      } catch {
        setSettings(loadFromLocalStorage());
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isAdmin, loadFromLocalStorage]);

  const updateSettings = useCallback((updates) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const persistLocally = useCallback((settingsToSave) => {
    if (typeof window === "undefined") return;
    const globalPayload = settingsToGlobalPayload(settingsToSave);
    Object.entries(globalPayload).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
    document.documentElement.setAttribute("data-landing-theme", settingsToSave.landingTheme);
  }, []);

  const saveSettings = useCallback(async (settingsToSave) => {
    persistLocally(settingsToSave);

    try {
      if (isAdmin) {
        const res = await fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(settingsToGlobalPayload(settingsToSave)),
        });
        if (!res.ok) throw new Error("Error al guardar en el servidor");
        showToast("Configuración guardada exitosamente");
      } else {
        const res = await fetch("/api/me/seller", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(settingsToSellerPayload(settingsToSave)),
        });
        if (!res.ok) throw new Error("Error al guardar mensaje por defecto");
        showToast("Mensaje por defecto guardado");
      }
      return true;
    } catch (error) {
      showToast(error.message || "Error al guardar");
      return false;
    }
  }, [isAdmin, persistLocally, showToast]);

  return { settings, loading, toast, updateSettings, saveSettings, showToast };
}
