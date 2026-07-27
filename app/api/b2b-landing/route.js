import { NextResponse } from "next/server";
import { requireAuth, isAdmin } from "@/lib/auth";
import { getB2BLandingContent, setB2BLandingContent } from "@/lib/b2b-landing.server";

export async function GET() {
  try {
    await requireAuth();
    const content = await getB2BLandingContent();
    return NextResponse.json(content);
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
    const { css, body: html } = body;

    if (typeof css !== "string" || typeof html !== "string") {
      return NextResponse.json({ error: "Se requieren css y body como strings" }, { status: 400 });
    }

    await setB2BLandingContent({ css, body: html });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const status = error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
