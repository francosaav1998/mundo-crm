import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, isAdmin } from "@/lib/auth";
import { rateLimit, getClientKey } from "@/lib/rate-limit";
import { sendEmail, buildLeadNotificationEmail } from "@/lib/email";

const MAX_LENGTHS = {
  name: 200,
  phone: 100,
  email: 200,
  city: 100,
  address: 300,
  plan: 100,
};

function sanitizeString(input, maxLength) {
  return String(input)
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, "");
}

function isValidEmail(email) {
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

function getDateRange(filter, customDate) {
  const now = new Date();
  const startOfDay = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };
  const endOfDay = (date) => {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  };

  switch (filter) {
    case "hoy":
      return { gte: startOfDay(now), lte: endOfDay(now) };
    case "ayer": {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      return { gte: startOfDay(yesterday), lte: endOfDay(yesterday) };
    }
    case "semana": {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      return { gte: startOfDay(weekAgo), lte: endOfDay(now) };
    }
    case "mes": {
      const monthAgo = new Date(now);
      monthAgo.setDate(now.getDate() - 30);
      return { gte: startOfDay(monthAgo), lte: endOfDay(now) };
    }
    case "custom": {
      if (!customDate) return undefined;
      const selected = new Date(customDate + "T12:00:00");
      if (isNaN(selected.getTime())) return undefined;
      return { gte: startOfDay(selected), lte: endOfDay(selected) };
    }
    default:
      return undefined;
  }
}

export async function GET(request) {
  try {
    const session = await requireAuth();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "25", 10)));
    const search = sanitizeString(searchParams.get("search") || "", 200).toLowerCase();
    const status = sanitizeString(searchParams.get("status") || "", 100);
    const dateFilter = sanitizeString(searchParams.get("dateFilter") || "todos", 20);
    const customDate = sanitizeString(searchParams.get("customDate") || "", 10);

    const where = {};

    if (!isAdmin(session.user)) {
      const userId = session.user?.id;
      const userEmail = session.user?.email || "";
      const seller = await prisma.seller.findUnique({ where: { userId } }) || await prisma.seller.findFirst({ where: { email: userEmail } });
      if (seller) {
        where.sellerId = seller.id;
      } else {
        where.assignedTo = userEmail;
      }
    }

    if (status && status !== "Todos") {
      where.status = status;
    }

    const dateRange = getDateRange(dateFilter, customDate);
    if (dateRange) {
      where.createdAt = dateRange;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { plan: { contains: search, mode: "insensitive" } },
      ];
    }

    const [leads, total] = await prisma.$transaction([
      prisma.lead.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.lead.count({ where }),
    ]);

    return NextResponse.json({
      leads,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    const status = error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function POST(request) {
  try {
    // Rate limit public lead submissions: 5 per minute per IP
    const limit = await rateLimit({
      windowMs: 60 * 1000,
      maxRequests: 5,
      key: `lead-submit:${getClientKey(request)}`,
    });

    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Inténtalo más tarde." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
      );
    }

    const body = await request.json();
    const { name, phone, email, city, address, plan, sellerId, planId } = body;

    if (!name || !phone || !city || !address || !plan) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "El correo electrónico no es válido" },
        { status: 400 }
      );
    }

    let assignedTo = process.env.ADMIN_EMAIL || "";
    let sellerSlug = "";

    if (sellerId) {
      const seller = await prisma.seller.findUnique({ where: { id: sellerId } });
      if (seller) {
        assignedTo = seller.email || seller.name;
        sellerSlug = seller.slug;
      }
    }

    const lead = await prisma.lead.create({
      data: {
        name: sanitizeString(name, MAX_LENGTHS.name),
        phone: sanitizeString(phone, MAX_LENGTHS.phone),
        email: email ? sanitizeString(email, MAX_LENGTHS.email) : "",
        city: sanitizeString(city, MAX_LENGTHS.city),
        address: sanitizeString(address, MAX_LENGTHS.address),
        plan: sanitizeString(plan, MAX_LENGTHS.plan),
        assignedTo,
        sellerId: sellerId || null,
        planId: planId || null,
      },
    });

    // Enviar notificación al vendedor
    try {
      const seller = sellerId
        ? await prisma.seller.findUnique({ where: { id: sellerId } })
        : null;
      if (seller?.email) {
        const { subject, html, text } = buildLeadNotificationEmail({ sellerName: seller.name, lead });
        await sendEmail({ to: seller.email, subject, html, text });
      }
    } catch (err) {
      // No fallar la creación del lead si el email no se envía
      console.error("[leads] Error enviando notificación:", err.message);
    }

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
