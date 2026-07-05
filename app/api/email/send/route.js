import { NextResponse } from "next/server";
import { requireAuth, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientKey } from "@/lib/rate-limit";
import nodemailer from "nodemailer";

const MAX_SUBJECT_LENGTH = 200;
const MAX_BODY_LENGTH = 50000;

function sanitizeEmailString(input, maxLength) {
  return String(input)
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, "");
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

export async function POST(request) {
  try {
    const session = await requireAuth();
    const admin = isAdmin(session.user);

    // Rate limit email sends: 30 per minute per IP
    const limit = await rateLimit({
      windowMs: 60 * 1000,
      maxRequests: 30,
      key: `email-send:${getClientKey(request)}`,
    });

    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Demasiados correos enviados. Inténtalo más tarde." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
      );
    }

    const body = await request.json();
    const { to, subject, body: emailBody, fromName } = body;

    if (!to || !subject || !emailBody) {
      return NextResponse.json(
        { error: "Faltan destinatario, asunto o cuerpo" },
        { status: 400 }
      );
    }

    if (!isValidEmail(to)) {
      return NextResponse.json(
        { error: "El correo del destinatario no es válido" },
        { status: 400 }
      );
    }

    if (!admin) {
      const seller = await prisma.seller.findUnique({ where: { userId: session.user.id } });
      if (!seller) {
        return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
      }
      const lead = await prisma.lead.findFirst({
        where: { email: String(to).trim(), sellerId: seller.id },
      });
      if (!lead) {
        return NextResponse.json(
          { error: "No puedes enviar correos a leads ajenos" },
          { status: 403 }
        );
      }
    }

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM || smtpUser;

    if (!smtpHost || !smtpUser || !smtpPass) {
      return NextResponse.json(
        { error: "SMTP no está configurado en el servidor." },
        { status: 503 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });

    const info = await transporter.sendMail({
      from: `"${sanitizeEmailString(fromName || "Mundo", 100)}" <${smtpFrom}>`,
      to: sanitizeEmailString(to, 254),
      subject: sanitizeEmailString(subject, MAX_SUBJECT_LENGTH),
      text: sanitizeEmailString(emailBody, MAX_BODY_LENGTH),
    });

    return NextResponse.json({ ok: true, messageId: info.messageId });
  } catch (error) {
    const status =
      error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json(
      { error: error.message || "Error enviando correo" },
      { status }
    );
  }
}
