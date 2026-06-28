import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { rateLimit, getClientKey } from "@/lib/rate-limit";
import nodemailer from "nodemailer";

export async function POST(request) {
  try {
    await requireAuth();

    // Rate limit email sends: 30 per minute per IP
    const limit = rateLimit({
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

    const { to, subject, body, fromName } = await request.json();

    if (!to || !subject || !body) {
      return NextResponse.json(
        { error: "Faltan destinatario, asunto o cuerpo" },
        { status: 400 }
      );
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
      from: `"${fromName || "Mundo"}" <${smtpFrom}>`,
      to,
      subject,
      text: body,
    });

    return NextResponse.json({ ok: true, messageId: info.messageId });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Error enviando correo" },
      { status: 500 }
    );
  }
}
