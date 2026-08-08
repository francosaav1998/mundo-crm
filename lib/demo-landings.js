export const OFFICIAL_DEMO_LANDINGS = {
  claro: "ohxZn08",
  entel: "GA9CU9o",
  movistar: "cJKWAcQ",
  vtr: "oOn6PS8",
  wom: "v1Lz_Yo",
  mundo: "mundo",
};

export const OFFICIAL_DEMO_COMPANIES = Object.keys(OFFICIAL_DEMO_LANDINGS);

export function getOfficialDemoHash(companySlug) {
  return OFFICIAL_DEMO_LANDINGS[String(companySlug || "").toLowerCase()] || null;
}

export function getOfficialDemoPath(companySlug) {
  const value = getOfficialDemoHash(companySlug);
  if (!value) return null;
  return `/landings/${value}.html`;
}

export function getOfficialDemoCompanySlug(slug) {
  const value = String(slug || "");
  if (!value.startsWith("demo-")) return "";
  const companySlug = value.slice(5).toLowerCase();
  return getOfficialDemoHash(companySlug) ? companySlug : "";
}

export function buildOfficialDemoUrl(slug, origin = "") {
  const companySlug = getOfficialDemoCompanySlug(slug);
  const path = getOfficialDemoPath(companySlug);
  if (!path) return "";
  const base = String(origin || "").replace(/\/$/, "");
  return `${base}${path}?slug=${encodeURIComponent(slug)}`;
}
