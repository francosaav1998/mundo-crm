import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const cookieOptions = {
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 días
};

export function createServiceClient() {
  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not defined");
  }
  if (!supabaseServiceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not defined");
  }
  return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function createClient() {
  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not defined");
  }
  if (!supabaseAnonKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined");
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookieOptions,
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, { ...cookieOptions, ...options })
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing sessions.
        }
      },
    },
  });
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@mundo-crm.local";

export async function getSession() {
  // Acceso local rápido para desarrollo
  if (process.env.NODE_ENV === "development") {
    const cookieStore = await cookies();
    const localAuth = cookieStore.get("mundo-local-auth");
    if (localAuth?.value === "admin") {
      return {
        user: {
          id: "local-admin",
          email: ADMIN_EMAIL,
          user_metadata: { name: "Admin Local", role: "admin" },
        },
        access_token: "local-token",
        refresh_token: "local-refresh",
      };
    }
  }

  const supabase = await createClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) return null;
  return session;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export function isAdmin(user) {
  if (!user) return false;
  if (user.email === ADMIN_EMAIL) return true;
  return user.user_metadata?.role === "admin";
}

export async function requireAdmin() {
  const session = await requireAuth();
  if (!isAdmin(session.user)) {
    throw new Error("Forbidden");
  }
  return session;
}
