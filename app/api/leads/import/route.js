import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import * as XLSX from "xlsx";

export async function POST(request) {
  try {
    await requireAuth();

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No se encontró el archivo" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    if (rows.length === 0) {
      return NextResponse.json({ error: "El archivo no contiene datos" }, { status: 400 });
    }

    const validStatuses = ["Nuevo", "No Contesta", "Contactado", "En Proceso", "Con Factibilidad", "Sin Factibilidad"];

    const leadsToCreate = [];
    let skipped = 0;

    rows.forEach((row) => {
      const name = String(row["Nombre"] || row["name"] || row["NOMBRE"] || "").trim();
      const phone = String(row["Telefono"] || row["phone"] || row["TELEFONO"] || row["Teléfono"] || row["Tel"] || "").trim();
      const email = String(row["Email"] || row["email"] || row["Correo"] || row["E-mail"] || "").trim();
      const city = String(row["Ciudad"] || row["city"] || row["CIUDAD"] || row["Comuna"] || row["comuna"] || "").trim();
      const address = String(row["Direccion"] || row["address"] || row["DIRECCION"] || row["Dirección"] || row["Dir"] || "").trim();
      const plan = String(row["Plan"] || row["plan"] || row["PLAN"] || "Sin Plan").trim();
      const statusRaw = String(row["Estado"] || row["status"] || row["ESTADO"] || "Nuevo").trim();

      if (!name || !phone) {
        skipped++;
        return;
      }

      const status = validStatuses.includes(statusRaw) ? statusRaw : "Nuevo";

      leadsToCreate.push({
        name,
        phone,
        email,
        city: city || "No especificada",
        address: address || "No especificada",
        plan: plan || "Sin Plan",
        status,
      });
    });

    if (leadsToCreate.length === 0) {
      return NextResponse.json({
        error: "No se encontraron filas válidas. Asegúrate de tener columnas: Nombre, Telefono, Email, Ciudad, Direccion, Plan, Estado",
      }, { status: 400 });
    }

    const result = await prisma.lead.createMany({
      data: leadsToCreate,
    });

    return NextResponse.json({
      imported: result.count,
      skipped,
      total: rows.length,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Error al importar el archivo" }, { status: 500 });
  }
}
