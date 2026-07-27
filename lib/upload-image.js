"use client";

/**
 * Utilidad cliente para comprimir imágenes antes de subirlas y para hacer
 * la subida a /api/upload con manejo de errores robusto.
 *
 * Contexto: Vercel limita el body de las funciones serverless a ~4.5 MB.
 * Fotos de celular suelen pesar 3-10 MB, por lo que subirlas tal cual
 * produce un 413 (y la respuesta de Vercel ni siquiera es JSON). Comprimiendo
 * en el cliente evitamos el límite y aceleramos todo.
 */

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // margen bajo el límite de Vercel (~4.5MB)
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.85;

function isCompressibleImage(file) {
  return (
    file &&
    typeof file.type === "string" &&
    file.type.startsWith("image/") &&
    file.type !== "image/svg+xml" &&
    file.type !== "image/gif"
  );
}

async function decodeToImageSource(file) {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {
      // fallback abajo
    }
  }
  // Fallback con <img> + object URL
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = url;
    });
    return img;
  } finally {
    // La revocamos luego de dibujar; createImageBitmap no necesita esto,
    // pero para <img> mantenerla viva hasta el draw es suficiente.
  }
}

/**
 * Comprime una imagen (si es necesario) y devuelve un File listo para subir.
 * Si el archivo ya pesa menos que el límite, se devuelve tal cual.
 * Si la compresión falla, se devuelve el archivo original.
 */
export async function compressImage(file, options = {}) {
  const {
    maxBytes = MAX_UPLOAD_BYTES,
    maxDimension = MAX_DIMENSION,
    quality = JPEG_QUALITY,
  } = options;

  if (!isCompressibleImage(file)) return file;
  if (file.size <= maxBytes) return file;

  try {
    const source = await decodeToImageSource(file);
    const srcW = source.width;
    const srcH = source.height;
    if (!srcW || !srcH) return file;

    const scale = Math.min(1, maxDimension / srcW, maxDimension / srcH);
    const width = Math.max(1, Math.round(srcW * scale));
    const height = Math.max(1, Math.round(srcH * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(source, 0, 0, width, height);
    if (typeof source.close === "function") source.close();

    let blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality)
    );

    // Si aun así quedó grande, bajamos calidad/dimensión una vez más.
    if (blob && blob.size > maxBytes) {
      const smallerScale = scale * 0.7;
      canvas.width = Math.max(1, Math.round(srcW * smallerScale));
      canvas.height = Math.max(1, Math.round(srcH * smallerScale));
      ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
      blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", Math.max(0.6, quality - 0.15))
      );
    }

    if (!blob) return file;

    const baseName = (file.name || "imagen").replace(/\.[^.]+$/, "") || "imagen";
    return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
  } catch {
    return file;
  }
}

/**
 * Sube una imagen a /api/upload comprimiéndola antes en el cliente.
 * Lanza Error con mensaje claro en caso de fallo.
 * @returns {Promise<{url: string, path: string}>}
 */
export async function uploadImage(file, folder = "uploads") {
  const prepared = await compressImage(file);

  const formData = new FormData();
  formData.append("file", prepared);
  formData.append("folder", folder);

  const res = await fetch("/api/upload", { method: "POST", body: formData });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // Vercel responde HTML/texto en 413 y otros errores de plataforma.
  }

  if (!res.ok) {
    if (res.status === 413) {
      throw new Error("La imagen es demasiado pesada para el servidor. Prueba con una foto más liviana.");
    }
    throw new Error(data?.error || `Error al subir imagen (${res.status})`);
  }

  if (!data?.url) {
    throw new Error("El servidor no devolvió la URL de la imagen");
  }

  return data;
}
