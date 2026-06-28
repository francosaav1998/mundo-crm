import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const settings = await prisma.setting.findMany();
    const config = Object.fromEntries(settings.map((s) => [s.key, s.value]));
    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await requireAuth();
    const body = await request.json();

    for (const [key, value] of Object.entries(body)) {
      await prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    }

    const settings = await prisma.setting.findMany();
    const config = Object.fromEntries(settings.map((s) => [s.key, s.value]));
    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
