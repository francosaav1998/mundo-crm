import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import nodemailer from "nodemailer";

export async function POST(request) {
  try {
    await requireAuth();
    const { to, subject, body, fromName, provider, host, port, user, pass, from } = await request.json();

    if (!to || !subject || !body) {
      return NextResponse.json({ error: "Faltan destinatario, asunto o cuerpo" }, { status: 400 });
    }

    let smtpHost = host;
    let smtpPort = parseInt(port || "587", 10);
    let smtpUser = user;
    let smtpPass = pass;
    let smtpFrom = from;

    // Presets de proveedores populares
    if (provider && provider !== "custom") {
      const presets = {
        gmail: { host: "smtp.gmail.com", port: 587 },
        outlook: { host: "smtp.office365.com", port: 587 },
        yahoo: { host: "smtp.mail.yahoo.com", port: 587 },
        zoho: { host: "smtp.zoho.com", port: 587 },
      };
      const p = presets[provider];
      if (p) {
        smtpHost = p.host;
        smtpPort = p.port;
      }
    }

    if (!smtpHost || !smtpUser || !smtpPass) {
      return NextResponse.json({ error: "Faltan datos SMTP. Selecciona un proveedor e ingresa usuario y contraseña." }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });

    const info = await transporter.sendMail({
      from: `"${fromName || "Mundo"}" <${smtpFrom || smtpUser}>`,
      to,
      subject,
      text: body,
    });

    return NextResponse.json({ ok: true, messageId: info.messageId });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Error enviando correo" }, { status: 500 });
  }
}