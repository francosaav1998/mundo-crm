import { getOfficialDemoCompanySlug } from "./demo-landings.js";

export function getDemoCompanySlug(slug) {
  const value = String(slug || "");
  return getOfficialDemoCompanySlug(value);
}

export function buildDemoSeller(slug, company) {
  return {
    id: null,
    userId: null,
    slug,
    name: `Demo ${company.name}`,
    email: `${slug}@example.com`,
    phone: "56912345678",
    photo: "",
    bio: "",
    gender: "",
    footerText: "",
    metaPixelId: "",
    landingTheme: "dark",
    active: true,
    landingContent: {},
    planOverrides: [],
    company,
    _count: { leads: 0 },
  };
}
