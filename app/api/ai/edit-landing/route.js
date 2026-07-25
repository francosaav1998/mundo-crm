import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { rateLimit, getClientKey } from "@/lib/rate-limit";
import { callOpenAI } from "@/lib/ai/openai";
import { buildSellerLandingSystemPrompt, buildB2BLandingSystemPrompt } from "@/lib/ai/prompts";

export async function POST(request) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;
    const ip = getClientKey(request);

    const rate = await rateLimit({
      windowMs: 60_000,
      maxRequests: 15,
      key: `ai-edit-landing:${userId || ip}`,
    });

    if (!rate.allowed) {
      return NextResponse.json(
        { success: false, error: "Demasiadas peticiones. Esperá un minuto." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { message, mode = "seller", context = {}, html = "", css = "" } = body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ success: false, error: "Mensaje requerido" }, { status: 400 });
    }

    if (message.length > 1000) {
      return NextResponse.json({ success: false, error: "Mensaje demasiado largo" }, { status: 400 });
    }

    const systemPrompt =
      mode === "b2b"
        ? buildB2BLandingSystemPrompt({ html, css })
        : buildSellerLandingSystemPrompt(context);

    const result = await callOpenAI({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message.trim() },
      ],
      temperature: 0.2,
      maxTokens: mode === "b2b" ? 4000 : 1500,
    });

    return NextResponse.json(result);
  } catch (error) {
    const status = error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json(
      { success: false, error: error.message || "Error del asistente" },
      { status }
    );
  }
}
