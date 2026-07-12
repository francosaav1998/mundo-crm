import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
      select: {
        id: true,
        slug: true,
        name: true,
        brandColor: true,
        brandColorDark: true,
        secondaryColor: true,
        accentColor: true,
        logoUrl: true,
        websiteUrl: true,
      },
    });
    return NextResponse.json(companies);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
