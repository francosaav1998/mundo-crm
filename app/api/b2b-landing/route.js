import { NextResponse } from "next/server";
import { requireAuth, isAdmin } from "@/lib/auth";
import { getB2BContent, setB2BContent } from "@/lib/b2b-landing.server";

export async function GET() {
  try {
    await requireAuth();
    const content = await getB2BContent();
    return NextResponse.json({ content });
  } catch (error) {
    const status = error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function PUT(request) {
  try {
    const session = await requireAuth();
    if (!isAdmin(session.user)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const content = body?.content;

    if (!content || typeof content !== "object" || Array.isArray(content)) {
      return NextResponse.json({ error: "Se requiere content como objeto" }, { status: 400 });
    }

    await setB2BContent(content);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const status = error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
