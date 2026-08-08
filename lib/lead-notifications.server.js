import nodemailer from "nodemailer";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

function escapeText(value) {
  return String(value || "").trim();
}

function getTransporter() {
  const smtpUser = String(process.env.SMTP_USER || "").trim();
  const smtpPass = String(process.env.SMTP_PASS || "").trim();
  const smtpService = String(process.env.SMTP_SERVICE || "").trim();

  if (!smtpUser || !smtpPass) return null;

  if (smtpService) {
    return nodemailer.createTransport({
      service: smtpService,
      auth: { user: smtpUser, pass: smtpPass },
    });
  }

  const smtpHost = String(process.env.SMTP_HOST || "").trim();
  if (!smtpHost) return null;

  const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
  });
}

export async function sendNewLeadNotification({ sellerEmail, lead }) {
  const recipient = String(sellerEmail || "").trim();
  if (!isValidEmail(recipient)) {
    return { sent: false, reason: "seller-email-missing" };
  }

  const transporter = getTransporter();
  if (!transporter) {
    return { sent: false, reason: "smtp-not-configured" };
  }

  const smtpFrom = String(process.env.SMTP_FROM || process.env.SMTP_USER || "").trim();
  const appUrl = String(process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");
  const dashboardUrl = appUrl ? `${appUrl}/dashboard?tab=leads` : "/dashboard?tab=leads";
  const subject = `Nuevo lead recibido: ${escapeText(lead.name)}`;
  const text = [
    "Tienes un nuevo lead en Mundo CRM.",
    "",
    `Nombre: ${escapeText(lead.name)}`,
    `Teléfono: ${escapeText(lead.phone)}`,
    `Email: ${escapeText(lead.email) || "No informado"}`,
    `Ciudad: ${escapeText(lead.city)}`,
    `Dirección: ${escapeText(lead.address)}`,
    `Plan solicitado: ${escapeText(lead.plan)}`,
    "",
    `Ver lead en el dashboard: ${dashboardUrl}`,
  ].join("\n");

  const info = await transporter.sendMail({
    from: smtpFrom,
    to: recipient,
    subject,
    text,
  });

  return { sent: true, messageId: info.messageId };
}
