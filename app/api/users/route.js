import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";

const ADMIN_EMAIL = "admin@mundo-crm.local";

async function isAdmin() {
  const supabase = await createServiceClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return false;
  if (user.email === ADMIN_EMAIL) return true;
  return user.user_metadata?.role === "admin";
}

export async function GET() {
  try {
    await requireAuth();

    if (!(await isAdmin())) {
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
    await requireAuth();

    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: "Solo el administrador puede crear usuarios" },
        { status: 403 }
      );
    }

    const { username, password, role = "user" } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Usuario y contraseña son obligatorios" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    const email = username.includes("@") ? username : `${username}@mundo-crm.local`;

    const supabase = createServiceClient();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
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
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
