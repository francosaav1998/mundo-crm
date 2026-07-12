import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { rateLimit, getClientKey } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";

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
    const { email, password, name, phone, companySlug } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "El correo es obligatorio" }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });
    }
    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
    }

    const sanitizedCompanySlug = String(companySlug || "").trim().toLowerCase();
    const company = sanitizedCompanySlug
      ? await prisma.company.findUnique({ where: { slug: sanitizedCompanySlug } })
      : null;

    const cookieStore = await cookies();
    const res = NextResponse.json({ success: true });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const cookieOptions = {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    };

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookieOptions,
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, { ...cookieOptions, ...options });
          });
        },
      },
    });

    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: {
        data: {
          full_name: name.trim(),
          role: "user",
          company: company?.slug || sanitizedCompanySlug || null,
        },
      },
    });

    if (error || !data.user) {
      return NextResponse.json(
        { error: error?.message || "Error al registrar usuario" },
        { status: 500 }
      );
    }

    return res;
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
