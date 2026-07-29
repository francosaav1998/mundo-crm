"use client";

import { useCallback, useEffect, useState } from "react";
import { normalizeWhatsAppNumber, getDefaultBio, getDefaultFooterText } from "@/lib/seller";

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
  sellerBio: "",
  sellerGender: "",
  landingTheme: "light",
  dashboardTheme: "dark",
  footerText: "",
  whatsappNumber: "",
  metaPixelId: "",
};

function getDefaultSettings(isAdmin = false) {
  return {
    sellerName: DEFAULT_SETTINGS.sellerName,
    sellerPhone: DEFAULT_SETTINGS.sellerPhone,
    sellerMsg: isAdmin
      ? "Hola, vi el CRM Vendedor Mundo y quiero activar mi prueba gratis de 7 días."
      : DEFAULT_SETTINGS.sellerMsg,
    sellerPhoto: DEFAULT_SETTINGS.sellerPhoto,
    sellerBio: DEFAULT_SETTINGS.sellerBio,
    sellerGender: DEFAULT_SETTINGS.sellerGender,
    landingTheme: DEFAULT_SETTINGS.landingTheme,
    dashboardTheme: DEFAULT_SETTINGS.dashboardTheme,
    footerText: DEFAULT_SETTINGS.footerText,
    whatsappNumber: DEFAULT_SETTINGS.whatsappNumber,
    metaPixelId: DEFAULT_SETTINGS.metaPixelId,
  };
}

function sellerToSettings(seller) {
  if (!seller) return {};
  const gender = seller.gender || "";
  const companyName = seller.company?.name || "Mundo";
  return {
    sellerName: seller.name || DEFAULT_SETTINGS.sellerName,
    sellerPhone: seller.phone || DEFAULT_SETTINGS.sellerPhone,
    sellerPhoto: seller.photo || DEFAULT_SETTINGS.sellerPhoto,
    sellerBio: seller.bio || getDefaultBio(gender, companyName),
    sellerGender: gender,
    landingTheme: seller.landingTheme || DEFAULT_SETTINGS.landingTheme,
    dashboardTheme: seller.dashboardTheme || DEFAULT_SETTINGS.dashboardTheme,
    footerText: seller.footerText || getDefaultFooterText(gender, companyName),
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
    dashboardTheme: settings.dashboardTheme || "dark",
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
  const [settings, setSettings] = useState(() => getDefaultSettings(isAdmin));
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const loadFromLocalStorage = useCallback(() => {
    const defaults = getDefaultSettings(isAdmin);
    if (typeof window === "undefined") return defaults;
    return {
      sellerName: localStorage.getItem("seller_name") || defaults.sellerName,
      sellerPhone: localStorage.getItem("seller_phone") || defaults.sellerPhone,
      sellerMsg: localStorage.getItem("seller_msg") || defaults.sellerMsg,
      sellerPhoto: localStorage.getItem("seller_photo") || defaults.sellerPhoto,
      sellerBio: localStorage.getItem("seller_bio") || defaults.sellerBio,
      landingTheme: localStorage.getItem("landing_theme") || defaults.landingTheme,
      dashboardTheme: localStorage.getItem("dashboard_theme") || defaults.dashboardTheme,
      footerText: localStorage.getItem("footer_text") !== null ? localStorage.getItem("footer_text") : defaults.footerText,
      whatsappNumber: normalizeWhatsAppNumber(localStorage.getItem("whatsapp_number") || defaults.whatsappNumber),
      metaPixelId: localStorage.getItem("meta_pixel_id") || defaults.metaPixelId,
      defaultMessage: localStorage.getItem("seller_msg") || defaults.sellerMsg,
    };
  }, [isAdmin]);

  useEffect(() => {
    async function load() {
      try {
        const [sellerRes, settingsRes] = await Promise.all([
          isAdmin ? Promise.resolve(null) : fetch("/api/me/seller"),
          isAdmin ? fetch("/api/settings") : Promise.resolve(null),
        ]);

        let next = { ...getDefaultSettings(isAdmin) };

        if (sellerRes && sellerRes.ok) {
          const seller = await sellerRes.json();
          next = { ...next, ...sellerToSettings(seller) };
        }

        if (settingsRes && settingsRes.ok) {
          const data = await settingsRes.json();
          next = {
            ...next,
            whatsappNumber: normalizeWhatsAppNumber(data.whatsapp_number || next.whatsappNumber),
            sellerMsg: data.seller_msg || next.sellerMsg,
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
    localStorage.setItem("dashboard_theme", settingsToSave.dashboardTheme || "dark");
    document.documentElement.setAttribute("data-landing-theme", settingsToSave.landingTheme || "light");
  }, []);

  const saveSettings = useCallback(async (settingsToSave) => {
    persistLocally(settingsToSave);

    try {
      if (isAdmin) {
        const res = await fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            whatsapp_number: normalizeWhatsAppNumber(settingsToSave.whatsappNumber),
            seller_msg: settingsToSave.sellerMsg,
          }),
        });
        if (!res.ok) throw new Error("Error al guardar en el servidor");
      } else {
        const sellerRes = await fetch("/api/me/seller", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(settingsToSellerPayload(settingsToSave)),
        });
        if (!sellerRes.ok) throw new Error("Error al guardar perfil");
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
