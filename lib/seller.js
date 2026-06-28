// Dynamic WhatsApp / seller config
export function normalizeWhatsAppNumber(number, defaultCountryCode = "56") {
  if (!number) return "";
  const digits = String(number).replace(/\D/g, "");

  // Already full international Chile mobile: 569XXXXXXXX (12 digits)
  if (digits.length === 12 && digits.startsWith("569")) return digits;

  // Chile mobile without country code: 9XXXXXXXX (9 digits)
  if (digits.length === 9 && digits.startsWith("9")) return `56${digits}`;

  // Chile mobile with country code but missing leading 9? e.g. 5612345678 -> fix to 56912345678
  if (digits.length === 11 && digits.startsWith("56") && !digits.startsWith("569")) {
    return digits.replace(/^56/, "569");
  }

  // If it already starts with 56, return as-is
  if (digits.startsWith("56")) return digits;

  // Default: prefix with country code + mobile prefix for Chile if it looks like a mobile
  if (digits.startsWith("9")) return `${defaultCountryCode}${digits}`;

  return `${defaultCountryCode}${digits}`;
}

const DEFAULT_CONFIG = {
  name: "Valentina Asesora Mundo",
  phone: "56912345678",
  defaultMessage: "Hola Valentina, vi tu página web y me gustaría recibir asesoría sobre los planes de Internet y TV Hogar de Mundo.",
};

// Mutable runtime config; updated from DB on the landing page and dashboard.
export const SELLER_CONFIG = {
  name: DEFAULT_CONFIG.name,
  phone: DEFAULT_CONFIG.phone,
  defaultMessage: DEFAULT_CONFIG.defaultMessage,
};

export function updateSellerConfig(config) {
  if (config.name !== undefined) SELLER_CONFIG.name = config.name;
  if (config.phone !== undefined) SELLER_CONFIG.phone = normalizeWhatsAppNumber(config.phone);
  if (config.defaultMessage !== undefined) SELLER_CONFIG.defaultMessage = config.defaultMessage;
}

export function sendWhatsAppMessage(text) {
  const encodedText = encodeURIComponent(text);
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const baseUrl = isMobile ? "https://api.whatsapp.com/send" : "https://web.whatsapp.com/send";
  const phone = normalizeWhatsAppNumber(SELLER_CONFIG.phone);
  const url = `${baseUrl}?phone=${phone}&text=${encodedText}`;
  window.open(url, "_blank");
}
