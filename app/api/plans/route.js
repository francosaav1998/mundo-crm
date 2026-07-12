import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const companySlug = searchParams.get("companySlug");
    const companyId = searchParams.get("companyId");
    const category = searchParams.get("category");

    const where = { active: true };

    if (companyId) {
      where.companyId = companyId;
    } else if (companySlug) {
      const company = await prisma.company.findUnique({
        where: { slug: companySlug },
        select: { id: true },
      });
      if (!company) {
        return NextResponse.json({ error: "Compañía no encontrada" }, { status: 404 });
      }
      where.companyId = company.id;
    }

    if (category) {
      where.category = category;
    }

    const plans = await prisma.plan.findMany({
      where,
      orderBy: [{ planOrder: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        companyId: true,
        category: true,
        title: true,
        speed: true,
        speedLabel: true,
        price: true,
        priceSubtitle: true,
        features: true,
        featured: true,
        value: true,
      },
    });

    return NextResponse.json(plans);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
