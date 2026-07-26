import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { findOrCreateSellerForUser } from "@/lib/seller.server";
import {
  createPreapproval,
  formatAmount,
  getPreapproval,
  getSubscriptionStatusLabel,
  hasMercadoPagoConfig,
} from "@/lib/mercadopago";

function formatChargeDate(value) {
  return new Date(value).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

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

    let normalizedSubscription = subscription;
    if (
      normalizedSubscription?.preapprovalId &&
      hasMercadoPagoConfig() &&
      (normalizedSubscription.status === "pending" || normalizedSubscription.status === "trial")
    ) {
      try {
        const preapproval = await getPreapproval(normalizedSubscription.preapprovalId);
        if (preapproval?.status === "authorized" && normalizedSubscription.status !== "active") {
          normalizedSubscription = await prisma.subscription.update({
            where: { id: normalizedSubscription.id },
            data: {
              status: "active",
              payerId: preapproval.payer_id ? String(preapproval.payer_id) : normalizedSubscription.payerId,
            },
            include: {
              payments: {
                orderBy: { paymentDate: "desc" },
                take: 10,
              },
            },
          });
          await prisma.seller.update({
            where: { id: seller.id },
            data: { active: true },
          });
        }
      } catch {
        // Si MercadoPago aún no confirma, devolvemos el estado actual sin romper la vista.
      }
    }

    if (!normalizedSubscription) {
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
    const isTrial = normalizedSubscription.status === "trial";
    const isActive = normalizedSubscription.status === "active";
    const isExpired =
      isTrial && normalizedSubscription.trialEndsAt && new Date(normalizedSubscription.trialEndsAt) < now;

    return NextResponse.json({
      id: normalizedSubscription.id,
      status: normalizedSubscription.status,
      label: getSubscriptionStatusLabel(normalizedSubscription.status),
      planName: normalizedSubscription.planName,
      planAmount: normalizedSubscription.planAmount,
      formattedAmount: formatAmount(normalizedSubscription.planAmount),
      trialEndsAt: normalizedSubscription.trialEndsAt,
      currentPeriodEnd: normalizedSubscription.currentPeriodEnd,
      nextPaymentDate: normalizedSubscription.currentPeriodEnd || normalizedSubscription.trialEndsAt,
      lastFourDigits: normalizedSubscription.lastFourDigits,
      cardBrand: normalizedSubscription.cardBrand,
      preapprovalId: normalizedSubscription.preapprovalId,
      isActive: isActive || (isTrial && !isExpired),
      isTrial,
      isExpired,
      payments: normalizedSubscription.payments.map((p) => ({
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
    const existingSubscription = await prisma.subscription.findUnique({
      where: { sellerId: seller.id },
      select: { id: true, trialEndsAt: true, status: true },
    });
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
    const minStartDate = new Date(Date.now() + 10 * 60 * 1000);
    const scheduledStartDate = existingSubscription?.trialEndsAt
      ? new Date(existingSubscription.trialEndsAt)
      : minStartDate;
    const startDate = new Date(
      Math.max(scheduledStartDate.getTime(), minStartDate.getTime())
    ).toISOString();
    const firstChargeDateLabel = formatChargeDate(startDate);
    const reason = `Plan Ejecutivo Mundo - Primer cobro el ${firstChargeDateLabel}`;

    const result = await createPreapproval({
      sellerId: seller.id,
      payerEmail,
      backUrl,
      startDate,
      reason,
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
        trialEndsAt: existingSubscription?.trialEndsAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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
      scheduledStartDate: startDate,
      scheduledStartDateLabel: firstChargeDateLabel,
    });
  } catch (error) {
    const status = error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
