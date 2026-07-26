import { NextResponse } from "next/server";
import { rateLimit, getClientKey } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import { createServiceClient } from "@/lib/supabase/server";
import { findOrCreateSellerForUser } from "@/lib/seller.server";
import { normalizeWhatsAppNumber, inferGender } from "@/lib/seller";

export async function POST(request) {
  try {
    const limit = await rateLimit({
      windowMs: 60 * 1000,
      maxRequests: 5,
      key: `auth-register:${getClientKey(request)}`,
    });

    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Demasiados intentos. Inténtalo más tarde." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
      );
    }

    const body = await request.json();
    const { email, password, name, phone, bio, companySlug, acceptedTerms } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "El correo es obligatorio" }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });
    }
    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
    }
    if (!acceptedTerms) {
      return NextResponse.json({ error: "Debes aceptar los términos y condiciones" }, { status: 400 });
    }

    const sanitizedCompanySlug = String(companySlug || "").trim().toLowerCase();
    const company = sanitizedCompanySlug
      ? await prisma.company.findUnique({ where: { slug: sanitizedCompanySlug } })
      : null;

    const supabase = createServiceClient();

    const { data, error } = await supabase.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password,
      email_confirm: true,
      user_metadata: {
        full_name: name.trim(),
        role: "user",
        company: company?.slug || sanitizedCompanySlug || null,
      },
    });

    if (error || !data.user) {
      return NextResponse.json(
        { error: error?.message || "Error al registrar usuario" },
        { status: 500 }
      );
    }

    const seller = await findOrCreateSellerForUser(data.user, company?.slug || sanitizedCompanySlug || undefined);
    await prisma.seller.update({
      where: { id: seller.id },
      data: {
        email: email.toLowerCase().trim(),
        phone: normalizeWhatsAppNumber(phone || ""),
        bio: String(bio || "").slice(0, 1000),
        gender: inferGender(name),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
