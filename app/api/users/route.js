import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { rateLimit, getClientKey } from "@/lib/rate-limit";

const VALID_ROLES = new Set(["admin", "user"]);

function sanitizeEmail(input) {
  return String(input).toLowerCase().trim().slice(0, 254);
}

function sanitizeUsername(input) {
  return String(input).trim().slice(0, 100);
}

function sanitizeRole(input) {
  const role = String(input).trim().toLowerCase();
  return VALID_ROLES.has(role) ? role : "user";
}

function checkUsersRateLimit(request) {
  const limit = rateLimit({
    windowMs: 60 * 1000,
    maxRequests: 10,
    key: `users:${getClientKey(request)}`,
  });

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Demasiadas peticiones. Inténtalo más tarde." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }
  return null;
}

export async function GET(request) {
  try {
    const rateLimitResponse = checkUsersRateLimit(request);
    if (rateLimitResponse) return rateLimitResponse;

    await requireAdmin();

    const supabase = createServiceClient();
    const {
      data: { users },
      error,
    } = await supabase.auth.admin.listUsers({ page: 1, perPage: 100 });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const simplified = users.map((u) => ({
      id: u.id,
      email: u.email,
      role: u.user_metadata?.role || "user",
      createdAt: u.created_at,
      lastSignInAt: u.last_sign_in_at,
    }));

    return NextResponse.json(simplified);
  } catch (error) {
    const status =
      error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function POST(request) {
  try {
    const rateLimitResponse = checkUsersRateLimit(request);
    if (rateLimitResponse) return rateLimitResponse;

    await requireAdmin();

    const body = await request.json();
    const { email, username, password, role = "user" } = body;

    // Support both email and username for backwards compatibility
    const userEmail =
      sanitizeEmail(email) ||
      (username
        ? sanitizeUsername(username).includes("@")
          ? sanitizeUsername(username)
          : `${sanitizeUsername(username)}@mundo-crm.local`
        : null);

    if (!userEmail || !userEmail.includes("@")) {
      return NextResponse.json(
        { error: "El correo es obligatorio" },
        { status: 400 }
      );
    }

    const sanitizedRole = sanitizeRole(role);
    const supabase = createServiceClient();

    if (password) {
      // Create user with password directly
      if (password.length < 6) {
        return NextResponse.json(
          { error: "La contraseña debe tener al menos 6 caracteres" },
          { status: 400 }
        );
      }

      const { data, error } = await supabase.auth.admin.createUser({
        email: userEmail,
        password,
        email_confirm: true,
        user_metadata: { role: sanitizedRole },
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        id: data.user.id,
        email: data.user.email,
        role: sanitizedRole,
        invited: false,
      });
    }

    // No password: send email invitation
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(
      userEmail,
      {
        data: { role: sanitizedRole },
      }
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      id: data.user.id,
      email: data.user.email,
      role: sanitizedRole,
      invited: true,
    });
  } catch (error) {
    const status =
      error.message === "Unauthorized" ? 401 : error.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
