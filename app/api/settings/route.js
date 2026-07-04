import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdmin } from "@/lib/auth";

// Lista blanca de claves permitidas para evitar almacenamiento arbitrario.
const ALLOWED_KEYS = new Set([
  "seller_name",
  "seller_phone",
  "seller_msg",
  "seller_photo",
  "seller_bio",
  "landing_theme",
  "footer_text",
  "whatsapp_number",
  "meta_pixel_id",
  "bg_video_url",
  "crm_email_use_smtp",
]);

const MAX_KEY_LENGTH = 64;
const MAX_VALUE_LENGTH = 2000;

function sanitizeValue(value) {
  const str = String(value).slice(0, MAX_VALUE_LENGTH);
  // Elimina etiquetas HTML/JS para mitigar XSS si estos valores se renderizan.
  return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
}

function sanitizeKey(key) {
  return String(key)
    .slice(0, MAX_KEY_LENGTH)
    .replace(/[^a-zA-Z0-9_]/g, "");
}

export async function GET() {
  try {
    // Público: la landing page necesita leer la configuración del vendedor.
    // Solo devolvemos claves en la lista blanca y valores sanitizados.
    const settings = await prisma.setting.findMany();
    const config = Object.fromEntries(
      settings
        .filter((s) => ALLOWED_KEYS.has(s.key))
        .map((s) => [s.key, sanitizeValue(s.value)])
    );
    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await requireAdmin();
    const body = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Body inválido" }, { status: 400 });
    }

    for (const [rawKey, value] of Object.entries(body)) {
      const key = sanitizeKey(rawKey);
      if (!key || !ALLOWED_KEYS.has(key)) {
        continue; // Ignora claves no permitidas en lugar de fallar toda la petición.
      }
      await prisma.setting.upsert({
        where: { key },
        update: { value: sanitizeValue(value) },
        create: { key, value: sanitizeValue(value) },
      });
    }

    const settings = await prisma.setting.findMany();
    const config = Object.fromEntries(
      settings
        .filter((s) => ALLOWED_KEYS.has(s.key))
        .map((s) => [s.key, sanitizeValue(s.value)])
    );
    return NextResponse.json(config);
  } catch (error) {
    const status =
      error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
