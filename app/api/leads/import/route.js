import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { rateLimit, getClientKey } from "@/lib/rate-limit";
import { parseLeadsFromExcel } from "@/lib/parse-leads-excel.mjs";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_ROWS = 5000;

export async function POST(request) {
  try {
    await requireAdmin();

    // Rate limit imports: 5 por minuto por IP
    const limit = await rateLimit({
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

    const { leads: leadsToCreate, skipped, total } = await parseLeadsFromExcel(buffer, {
      assignedTo: process.env.ADMIN_EMAIL || "",
    });

    if (total === 0) {
      return NextResponse.json({ error: "El archivo no contiene datos" }, { status: 400 });
    }

    if (total > MAX_ROWS) {
      return NextResponse.json(
        { error: `El archivo contiene más de ${MAX_ROWS} filas` },
        { status: 400 }
      );
    }

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
      total,
    }, { status: 201 });
  } catch (error) {
    const status =
      error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: error.message || "Error al importar el archivo" }, { status });
  }
}
