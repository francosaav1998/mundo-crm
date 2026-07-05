import { createClient } from "@/lib/supabase/client";

const BUCKET = "assets";

const ALLOWED = {
  videos: ["video/mp4", "video/webm", "video/quicktime"],
  seller: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"],
  uploads: ["application/pdf", "image/jpeg", "image/png", "image/webp"],
  documents: ["application/pdf"],
};

const EXT_MAP = {
  "video/quicktime": "mov",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  "application/pdf": "pdf",
};

function sanitize(name) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9.-]/g, "_")
    .slice(0, 120);
}

export async function uploadFileBrowser(file, folder = "uploads") {
  const allowed = ALLOWED[folder];
  if (!allowed || !allowed.includes(file.type)) {
    throw new Error(`Tipo ${file.type} no permitido en ${folder}`);
  }
  const ext = (file.name.split(".").pop() || EXT_MAP[file.type] || "bin").toLowerCase();
  const base = sanitize(file.name.replace(/\.[^.]+$/, ""));
  const path = `${folder}/${Date.now()}_${base}.${ext}`;

  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new Error(error.message || "Error subiendo a Supabase Storage");
  }

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
  return { url: pub.publicUrl, path: data.path };
}