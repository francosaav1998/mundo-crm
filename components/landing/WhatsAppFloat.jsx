"use client";

import { SELLER_CONFIG, sendWhatsAppMessage } from "@/lib/seller";

export default function WhatsAppFloat() {
  return (
    <div
      className="whatsapp-float"
      aria-label="Hablar por WhatsApp"
      onClick={() => sendWhatsAppMessage(SELLER_CONFIG.defaultMessage)}
    >
      <i className="bi bi-whatsapp"></i>
    </div>
  );
}
