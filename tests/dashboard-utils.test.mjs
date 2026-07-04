import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  renderTemplate,
  getUniqueCities,
  getWhatsAppUrl,
  formatDate,
  formatTime,
  calculateKpis,
  calculatePlanDistribution,
  calculateDailyIntake,
} from "../lib/dashboard/utils.js";

describe("renderTemplate", () => {
  const lead = {
    name: "Juan Pérez",
    phone: "56912345678",
    email: "juan@test.cl",
    city: "Santiago",
    address: "Av. Siempre Viva 123",
    plan: "Plan Fibra 800 Megas",
    status: "Nuevo",
  };

  it("replaces all known placeholders", () => {
    const template = "Hola {{nombre}}, tu plan es {{plan}} en {{ciudad}}. Estado: {{estado}}";
    const result = renderTemplate(template, lead);
    assert.equal(result, "Hola Juan Pérez, tu plan es Plan Fibra 800 Megas en Santiago. Estado: Nuevo");
  });

  it("is case insensitive", () => {
    const template = "Hola {{NOMBRE}}, teléfono {{Telefono}}";
    const result = renderTemplate(template, lead);
    assert.equal(result, "Hola Juan Pérez, teléfono 56912345678");
  });

  it("returns empty string for missing lead data", () => {
    const template = "Hola {{nombre}}, email {{email}}";
    const result = renderTemplate(template, { name: "Ana" });
    assert.equal(result, "Hola Ana, email ");
  });

  it("returns template unchanged when lead is null", () => {
    const template = "Hola {{nombre}}";
    assert.equal(renderTemplate(template, null), template);
  });
});

describe("getUniqueCities", () => {
  it("returns Todas plus sorted unique cities", () => {
    const leads = [{ city: "Santiago" }, { city: "Valparaíso" }, { city: "Santiago" }, { city: null }];
    const result = getUniqueCities(leads);
    assert.deepEqual(result, ["Todas", "Santiago", "Valparaíso"]);
  });

  it("returns only Todas for empty leads", () => {
    assert.deepEqual(getUniqueCities([]), ["Todas"]);
    assert.deepEqual(getUniqueCities(null), ["Todas"]);
  });
});

describe("getWhatsAppUrl", () => {
  it("returns WhatsApp Web URL with normalized phone and encoded text", () => {
    const url = getWhatsAppUrl("912345678", "Hola Juan");
    assert.ok(url.startsWith("https://web.whatsapp.com/send"));
    assert.ok(url.includes("phone=56912345678"));
    assert.ok(url.includes("text=Hola%20Juan"));
  });

  it("handles empty text", () => {
    const url = getWhatsAppUrl("56912345678", "");
    assert.ok(url.includes("phone=56912345678"));
    assert.ok(url.endsWith("text="));
  });
});

describe("formatDate", () => {
  it("formats date to Chile locale", () => {
    const result = formatDate("2026-07-04T12:00:00.000Z");
    assert.match(result, /^\d{1,2}[-\s][a-z]{3,}\.?$/i);
  });
});

describe("formatTime", () => {
  it("formats time to Chile locale", () => {
    const result = formatTime("2026-07-04T12:30:00.000Z");
    assert.match(result, /^\d{1,2}:\d{2}/);
  });
});

describe("calculateKpis", () => {
  it("calculates KPIs correctly", () => {
    const leads = [
      { status: "Nuevo" },
      { status: "Nuevo" },
      { status: "Contactado" },
      { status: "En Proceso" },
      { status: "Con Factibilidad" },
      { status: "Sin Factibilidad" },
    ];
    const result = calculateKpis(leads);
    assert.deepEqual(result, {
      total: 6,
      nuevos: 2,
      factibles: 1,
      sinFactibilidad: 1,
      contactados: 2,
    });
  });
});

describe("calculatePlanDistribution", () => {
  it("groups plans and strips price suffix", () => {
    const leads = [
      { plan: "Plan Fibra 800 Megas ($12.990)" },
      { plan: "Plan Fibra 800 Megas ($10.990)" },
      { plan: "Plan TV" },
    ];
    const result = calculatePlanDistribution(leads);
    assert.equal(result.length, 2);
    const fibra = result.find((p) => p.name === "Plan Fibra 800 Megas");
    assert.equal(fibra.value, 2);
  });

  it("uses Sin Plan for missing plans", () => {
    const result = calculatePlanDistribution([{}, { plan: "" }]);
    assert.equal(result.length, 1);
    assert.equal(result[0].name, "Sin Plan");
    assert.equal(result[0].value, 2);
  });
});

describe("calculateDailyIntake", () => {
  it("returns counts for the last 10 days", () => {
    const today = new Date();
    const dateStr = today.toLocaleDateString("es-CL", { day: "2-digit", month: "short" });
    const leads = [{ createdAt: today.toISOString() }];
    const result = calculateDailyIntake(leads, 10);

    assert.equal(result.length, 10);
    const todayEntry = result.find((d) => d.date === dateStr);
    assert.ok(todayEntry);
    assert.equal(todayEntry.count, 1);
  });

  it("returns zeros for empty leads", () => {
    const result = calculateDailyIntake([], 5);
    assert.equal(result.length, 5);
    assert.ok(result.every((d) => d.count === 0));
  });
});
