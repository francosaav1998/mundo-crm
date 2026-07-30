export function getTurnstileSiteKey() {
  return String(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "").trim();
}

export function isTurnstileEnabled() {
  return Boolean(getTurnstileSiteKey());
}
