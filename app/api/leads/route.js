import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

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
        name,
        phone,
        email: email || "",
        city,
        address,
        plan,
      },
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
