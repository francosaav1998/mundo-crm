import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientKey } from "@/lib/rate-limit";
import { buildSellerLandingUrl, getAppOrigin } from "@/lib/urls";

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

function getSubscriptionStatus(subscription, createdAt) {
  const now = new Date();

  if (subscription) {
    const isTrial = subscription.status === "trial";
    const trialExpired = isTrial && new Date(subscription.trialEndsAt) < now;
    const isActive = subscription.status === "active";
    const daysActive = Math.floor(
      Math.max(0, now.getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    return {
      status: subscription.status,
      isTrial,
      isActive,
      trialExpired,
      daysActive,
      trialDaysLeft: trialExpired
        ? 0
        : Math.max(0, TRIAL_DAYS - daysActive),
      planAmount: subscription.planAmount,
      nextPaymentDate: subscription.currentPeriodEnd || subscription.trialEndsAt,
    };
  }

  // Fallback para sellers sin registro de suscripción (cálculo legacy)
  if (!createdAt) return { status: "trial", isTrial: true, isActive: false, daysActive: 0, trialDaysLeft: TRIAL_DAYS, trialExpired: false, planAmount: 29990, nextPaymentDate: null };
  const start = new Date(createdAt);
  const ms = Math.max(0, now.getTime() - start.getTime());
  const daysActive = Math.floor(ms / (1000 * 60 * 60 * 24));
  const trialExpired = daysActive >= TRIAL_DAYS;
  return {
    status: "trial",
    isTrial: true,
    isActive: false,
    daysActive,
    trialDaysLeft: Math.max(0, TRIAL_DAYS - daysActive),
    trialExpired,
    planAmount: 29990,
    nextPaymentDate: null,
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
        subscription: true,
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
      const sub = seller ? getSubscriptionStatus(seller.subscription, seller.createdAt) : getSubscriptionStatus(null, u.created_at);
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
              billingActive: sub.isActive || (sub.isTrial && !sub.trialExpired),
              createdAt: seller.createdAt,
              leadsCount: seller._count?.leads || 0,
              landingUrl: buildSellerLandingUrl(seller.slug, { origin: getAppOrigin() }),
              ...sub,
            }
          : { ...sub, active: true, leadsCount: 0, landingUrl: null },
      };
    });

    return NextResponse.json(simplified);
  } catch (error) {
    const status =
      error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function DELETE(request) {
  try {
    const rateLimitResponse = await checkUsersRateLimit(request);
    if (rateLimitResponse) return rateLimitResponse;

    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const userId = String(searchParams.get("id") || "").trim();
    const email = String(searchParams.get("email") || "").trim().toLowerCase();

    if (!userId && !email) {
      return NextResponse.json({ error: "ID o email requerido" }, { status: 400 });
    }

    const where = userId
      ? { OR: [{ userId }, ...(email ? [{ email }] : [])] }
      : { email };

    const seller = await prisma.seller.findFirst({ where, select: { id: true } });
    if (seller) {
      await prisma.lead.deleteMany({ where: { sellerId: seller.id } });
      await prisma.seller.delete({ where: { id: seller.id } });
    }

    if (userId) {
      const supabase = createServiceClient();
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const status =
      error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
