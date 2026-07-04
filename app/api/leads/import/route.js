import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { rateLimit, getClientKey } from "@/lib/rate-limit";
import * as XLSX from "xlsx";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_ROWS = 5000;

const VALID_STATUSES = [
  "Nuevo",
  "No Contesta",
  "Contactado",
  "En Proceso",
  "Con Factibilidad",
  "Sin Factibilidad",
];

const MAX_LENGTHS = {
  name: 200,
  phone: 100,
  email: 200,
  city: 100,
  address: 300,
  plan: 100,
};

function sanitizeString(input, maxLength) {
  return String(input || "")
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, "");
}

function isValidEmail(email) {
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

export async function POST(request) {
  try {
    await requireAuth();

    // Rate limit imports: 5 por minuto por IP
    const limit = rateLimit({
      windowMs: 60 * 1000,
      maxRequests: 5,
      key: `lead-import:${getClientKey(request)}`,
    });

    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Demasiadas importaciones. Inténtalo más tarde." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No se encontró el archivo" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "El archivo excede el tamaño máximo de 10 MB" },
        { status: 413 }
      );
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

    if (rows.length > MAX_ROWS) {
      return NextResponse.json(
        { error: `El archivo contiene más de ${MAX_ROWS} filas` },
        { status: 400 }
      );
    }

    const leadsToCreate = [];
    let skipped = 0;

    rows.forEach((row) => {
      const name = sanitizeString(row["Nombre"] || row["name"] || row["NOMBRE"] || "", MAX_LENGTHS.name);
      const phone = sanitizeString(
        row["Telefono"] || row["phone"] || row["TELEFONO"] || row["Teléfono"] || row["Tel"] || "",
        MAX_LENGTHS.phone
      );
      const emailRaw = String(row["Email"] || row["email"] || row["Correo"] || row["E-mail"] || "").trim();
      const email = emailRaw ? sanitizeString(emailRaw, MAX_LENGTHS.email) : "";
      const city = sanitizeString(
        row["Ciudad"] || row["city"] || row["CIUDAD"] || row["Comuna"] || row["comuna"] || "",
        MAX_LENGTHS.city
      );
      const address = sanitizeString(
        row["Direccion"] || row["address"] || row["DIRECCION"] || row["Dirección"] || row["Dir"] || "",
        MAX_LENGTHS.address
      );
      const plan = sanitizeString(row["Plan"] || row["plan"] || row["PLAN"] || "Sin Plan", MAX_LENGTHS.plan);
      const statusRaw = String(row["Estado"] || row["status"] || row["ESTADO"] || "Nuevo").trim();

      if (!name || !phone) {
        skipped++;
        return;
      }

      if (email && !isValidEmail(email)) {
        skipped++;
        return;
      }

      const status = VALID_STATUSES.includes(statusRaw) ? statusRaw : "Nuevo";

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
    const status = error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: error.message || "Error al importar el archivo" }, { status });
  }
}
