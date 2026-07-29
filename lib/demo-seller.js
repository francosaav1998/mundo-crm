export function getDemoCompanySlug(slug) {
  const value = String(slug || "");
  return value.startsWith("demo-") ? value.slice(5) : "";
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
