export function hasTurnstileConfig() {
  return Boolean(
    String(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "").trim() &&
    String(process.env.TURNSTILE_SECRET_KEY || "").trim()
  );
}

export async function verifyTurnstileToken(token, ip) {
  const secret = String(process.env.TURNSTILE_SECRET_KEY || "").trim();
  if (!secret) throw new Error("TURNSTILE_SECRET_KEY no está configurado");

  const body = new URLSearchParams({ secret, response: String(token || "").trim() });
  if (ip) body.set("remoteip", ip);

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) throw new Error("No se pudo validar Turnstile");
  const data = await response.json();
  return Boolean(data?.success);
}
