import { NextResponse } from "next/server";
import { getSession, isAdmin } from "@/lib/auth";
import { rateLimit, getClientKey } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import { normalizeWhatsAppNumber, inferGender } from "@/lib/seller";

function slugify(text) {
  return String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase()
    .slice(0, 60);
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (slug) {
      const seller = await prisma.seller.findUnique({
        where: { slug },
        include: {
          company: true,
          planOverrides: { include: { plan: true } },
          _count: { select: { leads: true } },
        },
      });
      if (!seller) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
      return NextResponse.json(seller);
    }

    await requireAdminFromSession();
    const sellers = await prisma.seller.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        company: true,
        _count: { select: { leads: true } },
      },
    });
    return NextResponse.json(sellers);
  } catch (error) {
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const limit = await rateLimit({
      windowMs: 60 * 1000,
      maxRequests: 10,
      key: `sellers-post:${getClientKey(request)}`,
    });
    if (!limit.allowed) {
      return NextResponse.json({ error: "Demasiadas peticiones" }, { status: 429 });
    }

    const body = await request.json();
    const { name, email, phone, photo, bio, gender, bgVideoUrl, footerText, metaPixelId, landingTheme, companyId, companySlug } = body;

    if (!name) return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });

    let slug = slugify(body.slug || name);

    const existing = await prisma.seller.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
    }

    const userId = session.user.id;

    let resolvedCompanyId = null;
    if (companyId) {
      const companyById = await prisma.company.findUnique({ where: { id: companyId }, select: { id: true } });
      resolvedCompanyId = companyById?.id || null;
    }
    if (!resolvedCompanyId && companySlug) {
      const companyBySlug = await prisma.company.findUnique({ where: { slug: companySlug }, select: { id: true } });
      resolvedCompanyId = companyBySlug?.id || null;
    }

    const seller = await prisma.seller.create({
      data: {
        userId,
        slug,
        name: String(name).slice(0, 100),
        email: String(email || "").slice(0, 254),
        phone: normalizeWhatsAppNumber(phone || ""),
        photo: String(photo || "").slice(0, 500),
        bio: String(bio || "").slice(0, 1000),
        gender: gender || inferGender(name),
        bgVideoUrl: String(bgVideoUrl || "").slice(0, 500),
        footerText: String(footerText || "").slice(0, 500),
        metaPixelId: String(metaPixelId || "").slice(0, 50),
        landingTheme: String(landingTheme || "").slice(0, 20),
        companyId: resolvedCompanyId,
      },
    });

    return NextResponse.json(seller, { status: 201 });
  } catch (error) {
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function PUT(request) {
  try {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const body = await request.json();
    const { id, slug, ...updateData } = body;

    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    const seller = await prisma.seller.findUnique({ where: { id } });
    if (!seller) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

    const admin = isAdmin(session.user);
    if (!admin && seller.userId !== session.user.id) {
      throw new Error("Forbidden");
    }

    const allowed = ["name", "email", "phone", "photo", "bio", "bgVideoUrl", "footerText", "metaPixelId", "landingTheme", "active"];
    // La compañía se asigna solo en el registro y no se puede cambiar.
    if ("companyId" in updateData || "company" in updateData) {
      return NextResponse.json({ error: "No se puede cambiar la compañía" }, { status: 400 });
    }
    const data = {};
    for (const key of allowed) {
      if (key in updateData) data[key] = String(updateData[key] ?? "").slice(0, 1000);
    }
    if ("active" in updateData) data.active = Boolean(updateData.active);

    const updated = await prisma.seller.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (error) {
    const status = error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

async function requireAdminFromSession() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  if (!isAdmin(session.user)) throw new Error("Forbidden");
  return session;
}