import { normalizeWhatsAppNumber } from "./seller.js";

export function getWhatsAppUrl(phone, text) {
  const normalized = normalizeWhatsAppNumber(phone);
  const encodedText = encodeURIComponent(text || "");
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    typeof navigator !== "undefined" ? navigator.userAgent : ""
  );
  const baseUrl = isMobile ? "https://api.whatsapp.com/send" : "https://web.whatsapp.com/send";
  return `${baseUrl}?phone=${normalized}&text=${encodedText}`;
}

export function getGmailComposeUrl(to, subject, body) {
  return `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function getOutlookComposeUrl(to, subject, body) {
  return `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(to)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function getMailtoUrl(to, subject, body) {
  return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function openLink(url) {
  if (typeof window === "undefined") return;
  window.open(url, "_blank", "noopener,noreferrer");
}

export function openMailto(to, subject, body) {
  if (typeof window === "undefined") return;
  const url = getMailtoUrl(to, subject, body);
  const a = document.createElement("a");
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
