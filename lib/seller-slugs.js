export const RESERVED_SELLER_SLUGS = new Set([
  "www",
  "app",
  "admin",
  "api",
  "dashboard",
  "auth",
  "registro",
  "login",
  "billing",
  "terms",
  "terminos-y-condiciones",
  "politica-de-privacidad",
  "privacy",
  "support",
  "help",
  "mail",
  "ftp",
  "p",
]);

export function normalizeSellerSlugCandidate(value) {
  return String(value || "").trim().toLowerCase();
}

export function isReservedSellerSlug(value) {
  return RESERVED_SELLER_SLUGS.has(normalizeSellerSlugCandidate(value));
}

export function getSafeSellerSlug(value) {
  const normalized = normalizeSellerSlugCandidate(value);
  if (!normalized) return "vendedor";
  return isReservedSellerSlug(normalized) ? `${normalized}-landing` : normalized;
}
