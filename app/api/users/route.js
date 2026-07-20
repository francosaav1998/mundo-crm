import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientKey } from "@/lib/rate-limit";

const TRIAL_DAYS = 7;

async function checkUsersRateLimit(request) {
  const limit = await rateLimit({
    windowMs: 60 * 1000,
    maxRequests: 10,
    key: `users:${getClientKey(request)}`,
  });

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Demasiadas peticiones. Inténtalo más tarde." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }
  return null;
}

function getTrialInfo(createdAt) {
  if (!createdAt) return { daysActive: 0, trialDaysLeft: 0, trialExpired: false };
  const start = new Date(createdAt);
  const now = new Date();
  const ms = Math.max(0, now.getTime() - start.getTime());
  const daysActive = Math.floor(ms / (1000 * 60 * 60 * 24));
  const trialDaysLeft = Math.max(0, TRIAL_DAYS - daysActive);
  return {
    daysActive,
    trialDaysLeft,
    trialExpired: daysActive >= TRIAL_DAYS,
  };
}

export async function GET(request) {
  try {
    const rateLimitResponse = await checkUsersRateLimit(request);
    if (rateLimitResponse) return rateLimitResponse;

    await requireAdmin();

    const supabase = createServiceClient();
    const {
      data: { users },
      error,
    } = await supabase.auth.admin.listUsers({ page: 1, perPage: 100 });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const adminEmail = process.env.ADMIN_EMAIL || "admin@mundo-crm.local";

    // Excluir al admin y a otros usuarios con rol admin: la vista es solo de vendedores-clientes.
    const sellerUsers = users.filter(
      (u) => u.user_metadata?.role !== "admin" && u.email !== adminEmail
    );

    const userIds = sellerUsers.map((u) => u.id);
    const emails = sellerUsers.map((u) => u.email).filter(Boolean);

    const sellers = await prisma.seller.findMany({
      where: {
        OR: [
          { userId: { in: userIds } },
          ...(emails.length ? [{ email: { in: emails } }] : []),
        ],
      },
      include: {
        company: true,
        _count: { select: { leads: true } },
      },
    });

    const byUserId = new Map();
    const byEmail = new Map();
    for (const s of sellers) {
      if (s.userId) byUserId.set(s.userId, s);
      if (s.email) byEmail.set(s.email.toLowerCase(), s);
    }

    const simplified = sellerUsers.map((u) => {
      const seller =
        byUserId.get(u.id) || byEmail.get(String(u.email || "").toLowerCase()) || null;
      const trial = seller ? getTrialInfo(seller.createdAt) : getTrialInfo(u.created_at);
      return {
        id: u.id,
        email: u.email,
        role: u.user_metadata?.role || "user",
        createdAt: u.created_at,
        lastSignInAt: u.last_sign_in_at,
        seller: seller
          ? {
              id: seller.id,
              name: seller.name,
              slug: seller.slug,
              phone: seller.phone,
              company: seller.company?.name || null,
              companySlug: seller.company?.slug || null,
              active: seller.active,
              createdAt: seller.createdAt,
              leadsCount: seller._count?.leads || 0,
              landingUrl: `${process.env.NEXT_PUBLIC_APP_URL || ""}/p/${seller.slug}`,
              ...trial,
            }
          : { ...trial, active: true, leadsCount: 0, landingUrl: null },
      };
    });

    return NextResponse.json(simplified);
  } catch (error) {
    const status =
      error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
