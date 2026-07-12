import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, isAdmin } from "@/lib/auth";
import { rateLimit, getClientKey } from "@/lib/rate-limit";
import { parseLeadsFromExcel } from "@/lib/parse-leads-excel.mjs";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_ROWS = 5000;

export async function POST(request) {
  try {
    const session = await requireAuth();
    const admin = isAdmin(session.user);

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

    let sellerId = null;
    let assignedTo = process.env.ADMIN_EMAIL || "";

    if (!admin) {
      const seller = await prisma.seller.findUnique({ where: { userId: session.user.id } });
      if (!seller) {
        return NextResponse.json({ error: "Perfil de vendedora no encontrado" }, { status: 404 });
      }
      sellerId = seller.id;
      assignedTo = seller.email || session.user.email || "";
    }

    const { leads: leadsToCreate, skipped, total } = await parseLeadsFromExcel(buffer, {
      assignedTo,
      sellerId,
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
        error: "No se encontraron filas válidas. Solo se requieren Nombre y Teléfono. Las demás columnas son opcionales.",
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
