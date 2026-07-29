import { NextResponse } from "next/server";
import { getSession, isAdmin } from "@/lib/auth";
import { rateLimit, getClientKey } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import { normalizeWhatsAppNumber, inferGender, slugify } from "@/lib/seller";
import { getSafeSellerSlug } from "@/lib/seller-slugs";
import { buildDemoSeller, getDemoCompanySlug } from "@/lib/demo-seller";
import { OFFICIAL_DEMO_COMPANIES, getOfficialDemoCompanySlug } from "@/lib/demo-landings";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const slug = searchParams.get("slug");

    if (id) {
      const seller = await prisma.seller.findUnique({
        where: { id },
        include: {
          company: true,
          planOverrides: { include: { plan: true } },
          _count: { select: { leads: true } },
        },
      });
      if (!seller) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
      return NextResponse.json(seller);
    }

    if (slug) {
      let seller = await prisma.seller.findUnique({
        where: { slug },
        include: {
          company: true,
          planOverrides: { include: { plan: true } },
          _count: { select: { leads: true } },
        },
      });
      if (!seller) {
        const companySlug = getDemoCompanySlug(slug);
        if (companySlug) {
          const company = await prisma.company.findUnique({ where: { slug: companySlug } });
          if (company) seller = buildDemoSeller(slug, company);
        }
      }
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
    const companies = await prisma.company.findMany({ where: { active: true } });
    const visibleSellers = sellers.filter((seller) => {
      if (!seller.slug.startsWith("demo-")) return true;
      return Boolean(getOfficialDemoCompanySlug(seller.slug));
    });
    const sellerSlugs = new Set(visibleSellers.map((seller) => seller.slug));
    const demos = companies
      .filter((company) => OFFICIAL_DEMO_COMPANIES.includes(company.slug))
      .map((company) => buildDemoSeller(`demo-${company.slug}`, company))
      .filter((demo) => !sellerSlugs.has(demo.slug));
    return NextResponse.json([...visibleSellers, ...demos]);
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
    const { name, email, phone, photo, bio, gender, footerText, metaPixelId, landingTheme, companyId, companySlug } = body;

    if (!name) return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });

    let slug = getSafeSellerSlug(slugify(body.slug || name));

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
        footerText: String(footerText || "").slice(0, 500),
        metaPixelId: String(metaPixelId || "").slice(0, 50),
        landingTheme: String(landingTheme || "light").slice(0, 20),
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

    const allowed = ["name", "email", "phone", "photo", "bio", "footerText", "metaPixelId", "landingTheme", "active"];
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
