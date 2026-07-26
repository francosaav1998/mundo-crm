function normalizeHost(value) {
  return String(value || "")
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/:\d+$/, "")
    .toLowerCase();
}

export function getRootDomain() {
  return normalizeHost(process.env.NEXT_PUBLIC_ROOT_DOMAIN);
}

export function getAppOrigin() {
  return String(process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");
}

export function buildSellerLandingUrl(slug, options = {}) {
  if (!slug) return "/";

  const { absolute = false, origin = "" } = options;
  const rootDomain = getRootDomain();

  if (rootDomain) {
    if (origin) {
      const url = new URL(origin);
      return `${url.protocol}//${slug}.${rootDomain}`;
    }
    return absolute ? `https://${slug}.${rootDomain}` : `https://${slug}.${rootDomain}`;
  }

  const path = `/p/${slug}`;
  if (origin) {
    return `${String(origin).replace(/\/$/, "")}${path}`;
  }
  return path;
}

export function getSellerSubdomain(hostname) {
  const host = normalizeHost(hostname);
  const rootDomain = getRootDomain();
  if (!host || !rootDomain) return null;
  if (host === rootDomain || host === `www.${rootDomain}`) return null;
  if (!host.endsWith(`.${rootDomain}`)) return null;

  const subdomain = host.slice(0, -(`.${rootDomain}`).length);
  const reserved = new Set(["www", "app", "admin"]);
  if (!subdomain || reserved.has(subdomain)) return null;
  return subdomain;
}
