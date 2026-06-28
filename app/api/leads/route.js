import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { rateLimit, getClientKey } from "@/lib/rate-limit";

export async function GET() {
  try {
    await requireAuth();
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(leads);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(request) {
  try {
    // Rate limit public lead submissions: 5 per minute per IP
    const limit = rateLimit({
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
    const { name, phone, email, city, address, plan } = body;

    if (!name || !phone || !city || !address || !plan) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios" },
        { status: 400 }
      );
    }

    const lead = await prisma.lead.create({
      data: {
        name: String(name).slice(0, 200),
        phone: String(phone).slice(0, 100),
        email: email ? String(email).slice(0, 200) : "",
        city: String(city).slice(0, 100),
        address: String(address).slice(0, 300),
        plan: String(plan).slice(0, 100),
      },
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
