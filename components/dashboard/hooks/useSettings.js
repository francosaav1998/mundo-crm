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
    sellerMsg: seller.defaultMessage || DEFAULT_SETTINGS.sellerMsg,
  };
}

function settingsToSellerPayload(settings) {
  return {
    name: settings.sellerName,
    phone: normalizeWhatsAppNumber(settings.sellerPhone),
    photo: settings.sellerPhoto ? settings.sellerPhoto.trim() : "",
    bio: settings.sellerBio,
    gender: settings.sellerGender,
    landingTheme: settings.landingTheme,
    footerText: settings.footerText,
    metaPixelId: settings.metaPixelId.trim(),
    defaultMessage: settings.sellerMsg,
  };
}

function settingsToGlobalPayload(settings) {
  return {
    whatsapp_number: normalizeWhatsAppNumber(settings.whatsappNumber),
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
      defaultMessage: localStorage.getItem("seller_msg") || DEFAULT_SETTINGS.sellerMsg,
    };
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const [sellerRes, settingsRes] = await Promise.all([
          fetch("/api/me/seller"),
          isAdmin ? fetch("/api/settings") : Promise.resolve(null),
        ]);

        let next = { ...DEFAULT_SETTINGS };

        if (sellerRes.ok) {
          const seller = await sellerRes.json();
          next = { ...next, ...sellerToSettings(seller) };
        }

        if (settingsRes && settingsRes.ok) {
          const data = await settingsRes.json();
          next = {
            ...next,
            whatsappNumber: normalizeWhatsAppNumber(data.whatsapp_number || next.whatsappNumber),
          };
        }

        setSettings(next);
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
    localStorage.setItem("seller_name", settingsToSave.sellerName);
    localStorage.setItem("seller_phone", settingsToSave.sellerPhone);
    localStorage.setItem("seller_msg", settingsToSave.sellerMsg);
    localStorage.setItem("seller_photo", settingsToSave.sellerPhoto);
    localStorage.setItem("seller_bio", settingsToSave.sellerBio);
    localStorage.setItem("landing_theme", settingsToSave.landingTheme);
    localStorage.setItem("footer_text", settingsToSave.footerText);
    localStorage.setItem("meta_pixel_id", settingsToSave.metaPixelId);
    document.documentElement.setAttribute("data-landing-theme", settingsToSave.landingTheme);
  }, []);

  const saveSettings = useCallback(async (settingsToSave) => {
    persistLocally(settingsToSave);

    try {
      const sellerRes = await fetch("/api/me/seller", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsToSellerPayload(settingsToSave)),
      });
      if (!sellerRes.ok) throw new Error("Error al guardar perfil");

      if (isAdmin) {
        const res = await fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(settingsToGlobalPayload(settingsToSave)),
        });
        if (!res.ok) throw new Error("Error al guardar en el servidor");
      }

      showToast("Configuración guardada exitosamente");
      return true;
    } catch (error) {
      showToast(error.message || "Error al guardar");
      return false;
    }
  }, [isAdmin, persistLocally, showToast]);

  return { settings, loading, toast, updateSettings, saveSettings, showToast };
}
