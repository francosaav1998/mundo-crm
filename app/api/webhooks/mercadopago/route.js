import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPreapproval, getMercadoPagoClient } from "@/lib/mercadopago";
import { PreApproval, Payment } from "mercadopago";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const data = body.data || body;
    const topic = body.topic || body.type || "preapproval";

    if (topic === "preapproval" || topic === "subscription_preapproval") {
      const preapprovalId = data.id || body.id;
      if (!preapprovalId) {
        return NextResponse.json({ ok: true, ignored: true });
      }

      const preapproval = await getPreapproval(preapprovalId);
      if (!preapproval?.external_reference) {
        return NextResponse.json({ ok: true, ignored: true });
      }

      const sellerId = preapproval.external_reference;
      const status =
        preapproval.status === "authorized"
          ? "active"
          : preapproval.status === "cancelled"
          ? "cancelled"
          : "pending";

      const recurring = preapproval.auto_recurring || {};
      const currentPeriodStart = recurring.start_date ? new Date(recurring.start_date) : new Date();
      const currentPeriodEnd = recurring.end_date ? new Date(recurring.end_date) : null;

      const subscription = await prisma.subscription.update({
        where: { sellerId },
        data: {
          status,
          preapprovalId: String(preapproval.id),
          payerId: preapproval.payer_id ? String(preapproval.payer_id) : null,
          currentPeriodStart,
          currentPeriodEnd,
        },
      });

      // Si la suscripción se activa, asegurar que el seller esté activo.
      if (status === "active") {
        await prisma.seller.update({
          where: { id: sellerId },
          data: { active: true },
        });
      }

      if (status === "cancelled") {
        await prisma.seller.update({
          where: { id: sellerId },
          data: { active: false },
        });
      }

      return NextResponse.json({ ok: true, subscriptionId: subscription.id });
    }

    if (topic === "payment") {
      const paymentId = data.id || body.id;
      if (!paymentId) {
        return NextResponse.json({ ok: true, ignored: true });
      }

      const client = getMercadoPagoClient();
      const paymentApi = new Payment(client);
      const payment = await paymentApi.get({ id: paymentId });
      const sellerId = payment.external_reference;

      if (!sellerId) {
        return NextResponse.json({ ok: true, ignored: true });
      }

      const subscription = await prisma.subscription.findUnique({
        where: { sellerId },
      });

      if (subscription) {
        await prisma.paymentHistory.create({
          data: {
            subscriptionId: subscription.id,
            sellerId,
            amount: Math.round(payment.transaction_amount * 100) / 100,
            currency: payment.currency_id || "CLP",
            status: payment.status,
            externalId: String(payment.id),
            paymentDate: new Date(payment.date_created || Date.now()),
            metadata: payment,
          },
        });
      }

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true, ignored: true });
  } catch (error) {
    console.error("Webhook MercadoPago error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  // Endpoint de verificación para MercadoPago si es necesario.
  const { searchParams } = new URL(request.url);
  const challenge = searchParams.get("challenge") || "ok";
  return NextResponse.json({ ok: true, challenge });
}
