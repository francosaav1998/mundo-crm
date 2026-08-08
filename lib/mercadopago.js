import { MercadoPagoConfig, PreApproval } from "mercadopago";

const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

function getWebhookUrl() {
  const appUrl = String(process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");
  const webhookToken = process.env.MERCADOPAGO_WEBHOOK_TOKEN;
  if (!appUrl) return null;
  const base = `${appUrl}/api/webhooks/mercadopago`;
  return webhookToken ? `${base}?token=${encodeURIComponent(webhookToken)}` : base;
}

export function getMercadoPagoClient() {
  if (!accessToken) {
    throw new Error("MERCADOPAGO_ACCESS_TOKEN no está configurado");
  }
  return new MercadoPagoConfig({ accessToken });
}

export function hasMercadoPagoConfig() {
  return Boolean(accessToken);
}

export async function createPreapproval({ sellerId, payerEmail, backUrl, startDate, reason }) {
  const client = getMercadoPagoClient();
  const preApproval = new PreApproval(client);
  const notificationUrl = getWebhookUrl();
  const effectiveStartDate = startDate || new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const body = {
    reason: reason || "Plan Ejecutivo Mundo - Suscripción mensual",
    external_reference: sellerId,
    auto_recurring: {
      frequency: 1,
      frequency_type: "months",
      transaction_amount: 29990,
      currency_id: "CLP",
      start_date: effectiveStartDate,
      end_date: null,
    },
    back_url: backUrl,
    payer_email: payerEmail,
    status: "pending",
    ...(notificationUrl ? { notification_url: notificationUrl } : {}),
  };

  const result = await preApproval.create({ body });
  return result;
}

export async function getPreapproval(preapprovalId) {
  const client = getMercadoPagoClient();
  const preApproval = new PreApproval(client);
  return preApproval.get({ id: preapprovalId });
}

export async function cancelPreapproval(preapprovalId) {
  const client = getMercadoPagoClient();
  const preApproval = new PreApproval(client);
  return preApproval.update({
    id: preapprovalId,
    body: { status: "cancelled" },
  });
}

export function formatAmount(amount) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getSubscriptionStatusLabel(status) {
  const labels = {
    trial: "Periodo de prueba",
    active: "Activa",
    pending: "Pago pendiente",
    past_due: "Pago atrasado",
    cancelled: "Cancelada",
    inactive: "Inactiva",
  };
  return labels[status] || status;
}
