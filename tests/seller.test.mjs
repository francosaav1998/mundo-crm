import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeWhatsAppNumber,
  SELLER_CONFIG,
  updateSellerConfig,
  sendWhatsAppMessage,
} from "../lib/seller.js";

describe("normalizeWhatsAppNumber", () => {
  it("returns empty string for empty input", () => {
    assert.equal(normalizeWhatsAppNumber(""), "");
    assert.equal(normalizeWhatsAppNumber(null), "");
    assert.equal(normalizeWhatsAppNumber(undefined), "");
  });

  it("keeps valid full international Chile numbers", () => {
    assert.equal(normalizeWhatsAppNumber("56912345678"), "56912345678");
    assert.equal(normalizeWhatsAppNumber("+56912345678"), "56912345678");
    assert.equal(normalizeWhatsAppNumber("569 1234 5678"), "56912345678");
  });

  it("adds country code to 9-digit mobile numbers", () => {
    assert.equal(normalizeWhatsAppNumber("912345678"), "56912345678");
    assert.equal(normalizeWhatsAppNumber("9 1234 5678"), "56912345678");
  });

  it("adds leading 9 to 11-digit numbers starting with 56", () => {
    assert.equal(normalizeWhatsAppNumber("56123456789"), "569123456789");
    assert.equal(normalizeWhatsAppNumber("+56123456789"), "569123456789");
  });

  it("returns cleaned digits for unrecognized formats", () => {
    assert.equal(normalizeWhatsAppNumber("12345"), "12345");
  });
});

describe("updateSellerConfig", () => {
  beforeEach(() => {
    updateSellerConfig({
      name: "Valentina Asesora Mundo",
      phone: "56912345678",
      defaultMessage: "Hola",
    });
  });

  it("updates name, phone and defaultMessage", () => {
    updateSellerConfig({
      name: "Juan Asesor",
      phone: "912345678",
      defaultMessage: "Buenas",
    });

    assert.equal(SELLER_CONFIG.name, "Juan Asesor");
    assert.equal(SELLER_CONFIG.phone, "56912345678");
    assert.equal(SELLER_CONFIG.defaultMessage, "Buenas");
  });

  it("ignores undefined values", () => {
    updateSellerConfig({ name: "Pedro" });

    assert.equal(SELLER_CONFIG.name, "Pedro");
    assert.equal(SELLER_CONFIG.phone, "56912345678");
    assert.equal(SELLER_CONFIG.defaultMessage, "Hola");
  });
});

describe("sendWhatsAppMessage", () => {
  let openedUrl = null;
  const originalWindow = globalThis.window;

  beforeEach(() => {
    openedUrl = null;
    globalThis.window = {
      open: (url) => {
        openedUrl = url;
      },
    };
    updateSellerConfig({ phone: "56912345678" });
  });

  afterEach(() => {
    globalThis.window = originalWindow;
  });

  it("opens WhatsApp Web URL with encoded message", () => {
    sendWhatsAppMessage("Hola, ¿cómo estás?");

    assert.ok(openedUrl);
    assert.ok(openedUrl.startsWith("https://web.whatsapp.com/send"));
    assert.ok(openedUrl.includes("phone=56912345678"));
    assert.ok(openedUrl.includes("text=Hola%2C%20%C2%BFc%C3%B3mo%20est%C3%A1s%3F"));
  });
});
