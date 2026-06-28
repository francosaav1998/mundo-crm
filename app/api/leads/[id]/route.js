import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function PATCH(request, { params }) {
  try {
    await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const { status, notes, name, phone, email, city, address, plan } = body;

    const lead = await prisma.lead.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(city !== undefined && { city }),
        ...(address !== undefined && { address }),
        ...(plan !== undefined && { plan }),
      },
    });

    return NextResponse.json(lead);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
