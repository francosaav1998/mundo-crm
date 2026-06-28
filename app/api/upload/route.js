import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";

const BUCKET = "assets";

function sanitizeFilename(name) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9.-]/g, "_");
}

export async function POST(request) {
  try {
    await requireAuth();

    const formData = await request.formData();
    const file = formData.get("file");
    const folder = formData.get("folder") || "uploads";

    if (!file) {
      return NextResponse.json({ error: "No se encontró el archivo" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.name.split(".").pop().toLowerCase();
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
