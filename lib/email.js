import { Resend } from "resend";
import nodemailer from "nodemailer";

const FROM_DEFAULT = process.env.SMTP_FROM || process.env.RESEND_FROM || "notificaciones@mundo-crm.local";

export async function sendEmail({ to, subject, html, text }) {
  if (!to || !to.includes("@")) {
    console.warn("[email] No se envió correo: destinatario inválido", to);
    return { ok: false, error: "Destinatario inválido" };
  }

  // 1. Intentar Resend (más simple, recomendado)
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { data, error } = await resend.emails.send({
        from: FROM_DEFAULT,
        to,
        subject,
        html,
        text,
      });
      if (error) throw error;
      console.log("[email] Enviado vía Resend:", data?.id);
      return { ok: true, id: data?.id };
    } catch (err) {
      console.error("[email] Error enviando con Resend:", err.message);
      // No retornar, intentar SMTP como fallback
    }
  }

  // 2. Intentar SMTP
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: (Number(process.env.SMTP_PORT) || 587) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const info = await transporter.sendMail({
        from: FROM_DEFAULT,
        to,
        subject,
        html,
        text,
      });
      console.log("[email] Enviado vía SMTP:", info.messageId);
      return { ok: true, id: info.messageId };
    } catch (err) {
      console.error("[email] Error enviando con SMTP:", err.message);
    }
  }

  // 3. Fallback: solo log
  console.log("[email] No hay servicio configurado. Correo no enviado:");
  console.log({ to, subject, text: text || html?.replace(/<[^>]+>/g, "") });
  return { ok: false, error: "No hay servicio de email configurado" };
}

export function buildLeadNotificationEmail({ sellerName, lead }) {
  const subject = `🚀 Nuevo lead en tu landing de Mundo`;
  const text = `Hola ${sellerName || "Ejecutivo"},

Tienes un nuevo lead desde tu landing:

Nombre: ${lead.name || "No especificado"}
Teléfono: ${lead.phone || "No especificado"}
Email: ${lead.email || "No especificado"}
Comuna/Ciudad: ${lead.city || "No especificada"}
Dirección: ${lead.address || "No especificada"}
Plan de interés: ${lead.plan || "No especificado"}
Estado: ${lead.status || "Nuevo"}
Fecha: ${new Date(lead.createdAt || Date.now()).toLocaleString("es-CL")}

Ingresa a tu dashboard para gestionar este lead.
`;

  const html = `
<div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; color: #1f2937;">
  <h2 style="color: #00748E;">🚀 Nuevo lead en tu landing</h2>
  <p>Hola <strong>${sellerName || "Ejecutivo"}</strong>,</p>
  <p>Un visitante completó el formulario de tu landing. Estos son sus datos:</p>
  <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
    <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Nombre</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${lead.name || "No especificado"}</td></tr>
    <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Teléfono</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${lead.phone || "No especificado"}</td></tr>
    <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Email</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${lead.email || "No especificado"}</td></tr>
    <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Comuna/Ciudad</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${lead.city || "No especificada"}</td></tr>
    <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Dirección</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${lead.address || "No especificada"}</td></tr>
    <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Plan de interés</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${lead.plan || "No especificado"}</td></tr>
    <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Estado</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${lead.status || "Nuevo"}</td></tr>
    <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Fecha</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${new Date(lead.createdAt || Date.now()).toLocaleString("es-CL")}</td></tr>
  </table>
  <p style="margin-top: 24px;">
    <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard" style="background: #00748E; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 700; display: inline-block;">Ir al dashboard</a>
  </p>
  <p style="font-size: 12px; color: #6b7280; margin-top: 24px;">Mundo CRM - Notificaciones automáticas de leads.</p>
</div>
`;

  return { subject, html, text };
}
