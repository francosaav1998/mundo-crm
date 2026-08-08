import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { findOrCreateSellerForUser } from "@/lib/seller.server";
import { isValidPlanPrice } from "@/lib/landing";

export async function POST(request) {
  try {
    const session = await requireAuth();
    const sellerRecord = await findOrCreateSellerForUser(session.user);

    if (!sellerRecord.companyId) {
      return NextResponse.json({ error: "Vendedor sin compañía asignada" }, { status: 400 });
    }

    const company = await prisma.company.findUnique({
      where: { id: sellerRecord.companyId },
    });

    const body = await request.json().catch(() => ({}));
    const planCount = await prisma.plan.count({
      where: { companyId: sellerRecord.companyId },
    });

    const value = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const price = String(body.price || "").trim();
    if (!isValidPlanPrice(price)) {
      return NextResponse.json({ error: "El precio del plan debe ser mayor que 0" }, { status: 400 });
    }

    const plan = await prisma.plan.create({
      data: {
        companyId: sellerRecord.companyId,
        category: body.category || "internet",
        title: body.title || "Nuevo plan",
        speed: body.speed || "",
        speedLabel: body.speedLabel || "Megas",
        price,
        priceSubtitle: body.priceSubtitle || "",
        features: body.features || [{ icon: "bi-check-circle-fill", text: "Característica" }],
        featured: false,
        value,
        planOrder: typeof body.order === "number" ? body.order : planCount,
        active: true,
      },
    });

    return NextResponse.json({ ...plan, sellerActive: true, sellerOrder: plan.planOrder });
  } catch (error) {
    const status = error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function GET(request) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    const rawSellerId = searchParams.get("sellerId");

    let seller;
    if (rawSellerId) {
      seller = await prisma.seller.findUnique({
        where: { id: rawSellerId },
        include: { company: true },
      });
    } else {
      const sellerRecord = await findOrCreateSellerForUser(session.user);
      seller = await prisma.seller.findUnique({
        where: { id: sellerRecord.id },
        include: { company: true },
      });
    }

    if (!seller) {
      return NextResponse.json({ error: "Vendedor no encontrado" }, { status: 404 });
    }

    const companyId = seller.companyId;
    if (!companyId) {
      return NextResponse.json([]);
    }

    const [plans, overrides] = await Promise.all([
      prisma.plan.findMany({
        where: { companyId, active: true },
        orderBy: [{ planOrder: "asc" }, { createdAt: "asc" }],
      }),
      prisma.sellerPlanOverride.findMany({
        where: { sellerId: seller.id },
      }),
    ]);

    const overrideMap = new Map(overrides.map((o) => [o.planId, o]));

    const merged = plans.map((plan) => {
      const override = overrideMap.get(plan.id);
      const ov = override?.overrides || {};
      return {
        ...plan,
        overrideId: override?.id || null,
        sellerActive: override ? override.active : true,
        sellerOrder: override ? override.order : plan.planOrder,
        title: ov.title || plan.title,
        speed: ov.speed || plan.speed,
        speedLabel: ov.speedLabel || plan.speedLabel,
        price: ov.price || plan.price,
        priceSubtitle: ov.priceSubtitle || plan.priceSubtitle,
        features: Array.isArray(ov.features) && ov.features.length > 0 ? ov.features : plan.features,
        featured: typeof ov.featured === "boolean" ? ov.featured : plan.featured,
        cta: ov.cta || plan.cta || "",
      };
    });

    const validPlans = merged.filter((plan) => isValidPlanPrice(plan.price));
    validPlans.sort((a, b) => a.sellerOrder - b.sellerOrder);

    return NextResponse.json(validPlans);
  } catch (error) {
    const status = error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function DELETE(request) {
  try {
    const session = await requireAuth();
    const sellerRecord = await findOrCreateSellerForUser(session.user);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id requerido" }, { status: 400 });
    }

    const plan = await prisma.plan.findUnique({
      where: { id },
      include: { company: true },
    });

    if (!plan || plan.companyId !== sellerRecord.companyId) {
      return NextResponse.json({ error: "Plan no encontrado" }, { status: 404 });
    }

    await prisma.sellerPlanOverride.upsert({
      where: { sellerId_planId: { sellerId: sellerRecord.id, planId: id } },
      create: {
        sellerId: sellerRecord.id,
        planId: id,
        active: false,
        order: plan.planOrder,
        overrides: {},
      },
      update: { active: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const status = error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function PUT(request) {
  try {
    const session = await requireAuth();
    const sellerRecord = await findOrCreateSellerForUser(session.user);

    const body = await request.json();
    const { planId, active, order, overrides } = body;

    if (!planId) {
      return NextResponse.json({ error: "planId requerido" }, { status: 400 });
    }

    const existing = await prisma.sellerPlanOverride.findUnique({
      where: { sellerId_planId: { sellerId: sellerRecord.id, planId } },
    });

    let updated;
    const data = {
      active: typeof active === "boolean" ? active : existing?.active ?? true,
      order: typeof order === "number" ? order : existing?.order ?? 0,
      overrides: typeof overrides === "object" && overrides !== null ? overrides : existing?.overrides ?? {},
    };

    if (existing) {
      updated = await prisma.sellerPlanOverride.update({
        where: { id: existing.id },
        data,
      });
    } else {
      updated = await prisma.sellerPlanOverride.create({
        data: {
          sellerId: sellerRecord.id,
          planId,
          ...data,
        },
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    const status = error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
