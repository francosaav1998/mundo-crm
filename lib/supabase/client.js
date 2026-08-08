import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function createClient(options = {}) {
  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window === "undefined") return null;
    throw new Error("Supabase no está configurado");
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey, options);
}
