import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { normalizeWhatsAppNumber, inferGender } from "@/lib/seller";
import { findOrCreateSellerForUser } from "@/lib/seller.server";

const VALID_GENDERS = new Set(["", "male", "female"]);

const SELLER_UPDATE_FIELDS = [
  "name",
  "email",
  "phone",
  "photo",
  "bio",
  "gender",
  "footerText",
  "metaPixelId",
  "landingTheme",
  "landingContent",
  "defaultMessage",
  // NOTA: "companyId" se asigna solo en el registro y nunca se puede cambiar.
];

const MAX_LENGTHS = {
  name: 100,
  email: 254,
  phone: 20,
  photo: 500,
  bio: 2000,
  gender: 10,
  footerText: 500,
  metaPixelId: 50,
  landingTheme: 20,
  defaultMessage: 500,
};

function sanitize(value, maxLength) {
  return String(value ?? "").slice(0, maxLength);
}

export async function GET(request) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    const companySlug = searchParams.get("company");
    const seller = await findOrCreateSellerForUser(session.user, companySlug || undefined);
    const sellerWithCompany = await prisma.seller.findUnique({
      where: { id: seller.id },
      include: { company: true },
    });
    return NextResponse.json(sellerWithCompany);
  } catch (error) {
    const status = error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function PUT(request) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    const seller = await prisma.seller.findUnique({ where: { userId } });
    if (!seller) {
      return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
    }

    const body = await request.json();
    const data = {};

    for (const key of SELLER_UPDATE_FIELDS) {
      if (key in body) {
        let value = body[key];
        if (key === "phone") {
          value = normalizeWhatsAppNumber(value);
        } else if (key === "gender") {
          value = VALID_GENDERS.has(value) ? value : inferGender(body.name || seller.name);
        } else if (key === "landingContent") {
          data[key] = typeof value === "object" && value !== null ? value : {};
          continue;
        }
        data[key] = sanitize(value, MAX_LENGTHS[key]);
      }
    }

    const updated = await prisma.seller.update({
      where: { id: seller.id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    const status = error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
