import { NextResponse } from "next/server";
import { requireAuth, isAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { rateLimit, getClientKey } from "@/lib/rate-limit";

const BUCKET = "assets";
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
const MAX_FILENAME_LENGTH = 200;
const ALLOWED_FOLDERS = new Set(["seller", "videos", "uploads", "documents"]);

const ALLOWED_TYPES = [
  // Images
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  // Videos
  "video/mp4",
  "video/webm",
  "video/quicktime",
  // Documents
  "application/pdf",
];

const ALLOWED_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "svg",
  "mp4",
  "webm",
  "mov",
  "pdf",
]);

function sanitizeFilename(name) {
  const base = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9.-]/g, "_");
  return base.slice(0, MAX_FILENAME_LENGTH);
}

function sanitizeFolder(folder) {
  const clean = String(folder || "uploads").trim().toLowerCase();
  return ALLOWED_FOLDERS.has(clean) ? clean : "uploads";
}

export async function POST(request) {
  try {
    const session = await requireAuth();
    const admin = isAdmin(session.user);

    // Rate limit uploads: 10 por minuto por IP
    const limit = await rateLimit({
      windowMs: 60 * 1000,
      maxRequests: 10,
      key: `upload:${getClientKey(request)}`,
    });

    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Demasiadas subidas. Inténtalo más tarde." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const folder = sanitizeFolder(formData.get("folder"));

    if (!file) {
      return NextResponse.json(
        { error: "No se encontró el archivo" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de archivo no permitido" },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { error: "Extensión de archivo no permitida" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "El archivo excede el tamaño máximo de 50 MB" },
        { status: 413 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const timestamp = Date.now();
    const sanitized = sanitizeFilename(file.name.replace(/\.[^.]+$/, ""));
    const path = `${folder}/${timestamp}_${sanitized}.${ext}`;

    const supabase = createServiceClient();
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(data.path);

    return NextResponse.json({ url: publicUrl, path: data.path });
  } catch (error) {
    const status =
      error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
