import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, getClientKey } from "@/lib/rate-limit";

export async function POST(request) {
  try {
    // Rate limit login attempts: 5 per minute per IP
    const limit = await rateLimit({
      windowMs: 60 * 1000,
      maxRequests: 5,
      key: `auth-login:${getClientKey(request)}`,
    });

    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Demasiados intentos. Inténtalo más tarde." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
      );
    }

    const { username, password } = await request.json();
    // Backwards compatibility: allow plain usernames by appending the local domain.
    const email = username.includes("@") ? username : `${username}@mundo-crm.local`;

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
