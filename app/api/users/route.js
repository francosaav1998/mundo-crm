import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";

const ADMIN_EMAIL = "admin@mundo-crm.local";

function isAdmin(user) {
  if (!user) return false;
  if (user.email === ADMIN_EMAIL) return true;
  return user.user_metadata?.role === "admin";
}

export async function GET() {
  try {
    const session = await requireAuth();
    if (!isAdmin(session.user)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await requireAuth();

    if (!isAdmin(session.user)) {
      return NextResponse.json(
        { error: "Solo el administrador puede crear usuarios" },
        { status: 403 }
      );
    }

    const { email, username, password, role = "user" } = await request.json();

    // Support both email and username for backwards compatibility
    const userEmail =
      email || (username ? (username.includes("@") ? username : `${username}@mundo-crm.local`) : null);

    if (!userEmail) {
      return NextResponse.json(
        { error: "El correo es obligatorio" },
        { status: 400 }
      );
    }

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
        user_metadata: { role },
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        id: data.user.id,
        email: data.user.email,
        role,
        invited: false,
      });
    }

    // No password: send email invitation
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(
      userEmail,
      {
        data: { role },
      }
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      id: data.user.id,
      email: data.user.email,
      role,
      invited: true,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
