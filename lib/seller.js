// Dynamic WhatsApp / seller config
export function normalizeWhatsAppNumber(number) {
  if (!number) return "";
  const digits = String(number).replace(/\D/g, "");

  // Already full international Chile mobile: 569XXXXXXXX (12 digits)
  if (digits.length === 12 && digits.startsWith("569")) return digits;

  // Chile mobile without country code: 9XXXXXXXX (9 digits)
  if (digits.length === 9 && digits.startsWith("9")) return `56${digits}`;

  // Country code present but missing leading 9: 56XXXXXXXXX (11 digits)
  if (digits.length === 11 && digits.startsWith("56") && !digits.startsWith("569")) {
    return `569${digits.slice(2)}`;
  }

  // Otherwise return cleaned digits as-is so callers can decide
  return digits;
}

const DEFAULT_CONFIG = {
  name: "Ejecutiva Mundo",
  phone: "",
  defaultMessage: "Hola, vi tu página web y me gustaría recibir asesoría sobre los planes de Internet y TV Hogar de Mundo.",
};

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
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    typeof navigator !== "undefined" ? navigator.userAgent : ""
  );
  const baseUrl = isMobile ? "https://api.whatsapp.com/send" : "https://web.whatsapp.com/send";
  const phone = normalizeWhatsAppNumber(SELLER_CONFIG.phone);
  const url = `${baseUrl}?phone=${phone}&text=${encodedText}`;
  if (typeof window !== "undefined") {
    window.open(url, "_blank");
  }
}
