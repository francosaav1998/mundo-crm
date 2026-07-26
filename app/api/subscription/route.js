import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { findOrCreateSellerForUser } from "@/lib/seller.server";
import {
  createPreapproval,
  formatAmount,
  getSubscriptionStatusLabel,
  hasMercadoPagoConfig,
} from "@/lib/mercadopago";

export async function GET(request) {
  try {
    const session = await requireAuth();
    const seller = await findOrCreateSellerForUser(session.user);
    const subscription = await prisma.subscription.findUnique({
      where: { sellerId: seller.id },
      include: {
        payments: {
          orderBy: { paymentDate: "desc" },
          take: 10,
        },
      },
    });

    if (!subscription) {
      return NextResponse.json({
        status: "inactive",
        label: "Sin suscripción",
        planAmount: 29990,
        formattedAmount: formatAmount(29990),
        trialEndsAt: null,
        nextPaymentDate: null,
        isActive: false,
        isTrial: false,
        payments: [],
      });
    }

    const now = new Date();
    const isTrial = subscription.status === "trial";
    const isActive = subscription.status === "active";
    const isExpired =
      isTrial && subscription.trialEndsAt && new Date(subscription.trialEndsAt) < now;

    return NextResponse.json({
      id: subscription.id,
      status: subscription.status,
      label: getSubscriptionStatusLabel(subscription.status),
      planName: subscription.planName,
      planAmount: subscription.planAmount,
      formattedAmount: formatAmount(subscription.planAmount),
      trialEndsAt: subscription.trialEndsAt,
      currentPeriodEnd: subscription.currentPeriodEnd,
      nextPaymentDate: subscription.currentPeriodEnd || subscription.trialEndsAt,
      lastFourDigits: subscription.lastFourDigits,
      cardBrand: subscription.cardBrand,
      preapprovalId: subscription.preapprovalId,
      isActive: isActive || (isTrial && !isExpired),
      isTrial,
      isExpired,
      payments: subscription.payments.map((p) => ({
        id: p.id,
        amount: p.amount,
        formattedAmount: formatAmount(p.amount),
        status: p.status,
        paymentDate: p.paymentDate,
      })),
    });
  } catch (error) {
    const status = error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function POST(request) {
  try {
    const session = await requireAuth();
    if (!hasMercadoPagoConfig()) {
      return NextResponse.json(
        { error: "MercadoPago no está configurado" },
        { status: 503 }
      );
    }

    const seller = await findOrCreateSellerForUser(session.user);
    const payerEmail = seller.email || session.user.email || "";
    if (!payerEmail) {
      return NextResponse.json(
        { error: "El vendedor no tiene correo configurado para MercadoPago" },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const origin = new URL(request.url).origin;
    const backUrl = body.backUrl || `${origin}/dashboard?tab=billing`;

    const result = await createPreapproval({
      sellerId: seller.id,
      payerEmail,
      backUrl,
    });

    if (!result?.id) {
      return NextResponse.json(
        { error: "No se pudo crear la suscripción en MercadoPago" },
        { status: 500 }
      );
    }

    await prisma.subscription.upsert({
      where: { sellerId: seller.id },
      create: {
        sellerId: seller.id,
        status: "pending",
        preapprovalId: result.id,
        trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        planAmount: 29990,
      },
      update: {
        status: "pending",
        preapprovalId: result.id,
      },
    });

    return NextResponse.json({
      initPoint: result.init_point,
      preapprovalId: result.id,
    });
  } catch (error) {
    const status = error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
