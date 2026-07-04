import { describe, it } from "node:test";
import assert from "node:assert/strict";
import ExcelJS from "exceljs";
import { parseLeadsFromExcel } from "../lib/parse-leads-excel.mjs";

async function buildBuffer(rows) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Leads");
  for (const row of rows) {
    sheet.addRow(row);
  }
  return Buffer.from(await workbook.xlsx.writeBuffer());
}

describe("parseLeadsFromExcel", () => {
  it("parses Spanish headers and returns valid leads", async () => {
    const buffer = await buildBuffer([
      ["Nombre", "Telefono", "Email", "Ciudad", "Direccion", "Plan", "Estado"],
      ["Juan Pérez", "+56912345678", "juan@test.cl", "Santiago", "Av. Siempre Viva 123", "Plan Fibra 800 Megas", "Nuevo"],
      ["Ana López", "912345678", "ana@test.cl", "Valparaíso", "Calle Falsa 456", "Plan Fibra 400 Megas", "Contactado"],
    ]);

    const { leads, skipped, total } = await parseLeadsFromExcel(buffer, { assignedTo: "admin@test.cl" });

    assert.equal(total, 2);
    assert.equal(skipped, 0);
    assert.equal(leads.length, 2);
    assert.equal(leads[0].name, "Juan Pérez");
    assert.equal(leads[0].status, "Nuevo");
    assert.equal(leads[0].assignedTo, "admin@test.cl");
    assert.equal(leads[1].status, "Contactado");
  });

  it("parses English headers", async () => {
    const buffer = await buildBuffer([
      ["name", "phone", "email", "city", "address", "plan", "status"],
      ["John Doe", "+56987654321", "john@example.com", "Concepción", "Street 1", "Plan TV", "En Proceso"],
    ]);

    const { leads, skipped, total } = await parseLeadsFromExcel(buffer);

    assert.equal(total, 1);
    assert.equal(skipped, 0);
    assert.equal(leads[0].name, "John Doe");
    assert.equal(leads[0].status, "En Proceso");
  });

  it("skips rows with missing name or phone and invalid emails", async () => {
    const buffer = await buildBuffer([
      ["Nombre", "Telefono", "Email", "Ciudad", "Direccion", "Plan", "Estado"],
      ["", "912345678", "missing@test.cl", "Santiago", "Av. 1", "Plan A", "Nuevo"],
      ["Pedro Rojas", "", "pedro@test.cl", "Santiago", "Av. 2", "Plan B", "Nuevo"],
      ["María Díaz", "912345679", "no-es-un-email", "Santiago", "Av. 3", "Plan C", "Nuevo"],
      ["Luis Torres", "912345670", "luis@test.cl", "Santiago", "Av. 4", "Plan D", "Nuevo"],
    ]);

    const { leads, skipped, total } = await parseLeadsFromExcel(buffer);

    assert.equal(total, 4);
    assert.equal(skipped, 3);
    assert.equal(leads.length, 1);
    assert.equal(leads[0].name, "Luis Torres");
  });

  it("defaults missing optional fields and invalid statuses", async () => {
    const buffer = await buildBuffer([
      ["Nombre", "Telefono"],
      ["Carlos Vega", "912345671"],
    ]);

    const { leads } = await parseLeadsFromExcel(buffer);

    assert.equal(leads.length, 1);
    assert.equal(leads[0].city, "No especificada");
    assert.equal(leads[0].address, "No especificada");
    assert.equal(leads[0].plan, "Sin Plan");
    assert.equal(leads[0].status, "Nuevo");
    assert.equal(leads[0].email, "");
  });
});
