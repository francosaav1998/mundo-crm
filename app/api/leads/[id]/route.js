import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, isAdmin } from "@/lib/auth";
import { rateLimit, getClientKey } from "@/lib/rate-limit";

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
  notes: 2000,
};

function sanitizeString(input, maxLength) {
  return String(input)
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, "");
}

export async function PATCH(request, { params }) {
  try {
    const session = await requireAuth();

    // Rate limit updates: 30 por minuto por IP
    const limit = await rateLimit({
      windowMs: 60 * 1000,
      maxRequests: 30,
      key: `lead-update:${getClientKey(request)}`,
    });

    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Inténtalo más tarde." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { status, notes, name, phone, email, city, address, plan, assignedTo } = body;
    const userIsAdmin = isAdmin(session.user);

    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 });
    }

    if (!userIsAdmin) {
      const userId = session.user?.id;
      const userEmail = session.user?.email || "";
      const seller = await prisma.seller.findUnique({ where: { userId } }) || await prisma.seller.findFirst({ where: { email: userEmail } });
      const ownsBySeller = seller && existing.sellerId === seller.id;
      const ownsByEmail = existing.assignedTo && existing.assignedTo === userEmail;
      if (!ownsBySeller && !ownsByEmail) {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 });
      }
    }

    const data = {};
    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json({ error: "Estado no válido" }, { status: 400 });
      }
      data.status = status;
    }
    if (notes !== undefined) data.notes = sanitizeString(notes, MAX_LENGTHS.notes);
    if (name !== undefined) data.name = sanitizeString(name, MAX_LENGTHS.name);
    if (phone !== undefined) data.phone = sanitizeString(phone, MAX_LENGTHS.phone);
    if (email !== undefined) {
      const cleanEmail = sanitizeString(email, MAX_LENGTHS.email);
      if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return NextResponse.json(
          { error: "El correo electrónico no es válido" },
          { status: 400 }
        );
      }
      data.email = cleanEmail;
    }
    if (city !== undefined) data.city = sanitizeString(city, MAX_LENGTHS.city);
    if (address !== undefined) data.address = sanitizeString(address, MAX_LENGTHS.address);
    if (plan !== undefined) data.plan = sanitizeString(plan, MAX_LENGTHS.plan);
    if (assignedTo !== undefined && userIsAdmin) {
      data.assignedTo = sanitizeString(assignedTo, 254);
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No se proporcionaron campos para actualizar" },
        { status: 400 }
      );
    }

    const lead = await prisma.lead.update({
      where: { id },
      data,
    });

    return NextResponse.json(lead);
  } catch (error) {
    const status = error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
