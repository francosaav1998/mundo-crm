import { prisma } from "@/lib/prisma";

export const B2B_LANDING_CSS_KEY = "b2b-landing-css";
export const B2B_LANDING_BODY_KEY = "b2b-landing-body";

function normalizeB2BBody(body) {
  return String(body || "")
    .replace(/Ejecutiva de Ventas Oficial Mundo/g, "Gestion Vendedores · CRM comercial y landings")
    .replace(/CRM Vendedor Mundo/g, "Gestion Vendedores");
}

export async function getB2BLandingContent() {
  const [cssSetting, bodySetting] = await prisma.$transaction([
    prisma.setting.findUnique({ where: { key: B2B_LANDING_CSS_KEY } }),
    prisma.setting.findUnique({ where: { key: B2B_LANDING_BODY_KEY } }),
  ]);

  return {
    css: cssSetting?.value || null,
    body: bodySetting?.value ? normalizeB2BBody(bodySetting.value) : null,
  };
}

export async function setB2BLandingContent({ css, body }) {
  const normalizedBody = normalizeB2BBody(body);

  await prisma.$transaction([
    prisma.setting.upsert({
      where: { key: B2B_LANDING_CSS_KEY },
      update: { value: css },
      create: { key: B2B_LANDING_CSS_KEY, value: css },
    }),
    prisma.setting.upsert({
      where: { key: B2B_LANDING_BODY_KEY },
      update: { value: normalizedBody },
      create: { key: B2B_LANDING_BODY_KEY, value: normalizedBody },
    }),
  ]);
}
