import { NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request) {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // Acceso local rápido para desarrollo (alineado con getSession() de lib/supabase/server.js)
  const isLocalDevAdmin =
    process.env.NODE_ENV === "development" &&
    request.cookies.get("mundo-local-auth")?.value === "admin";
  const effectiveUser = user || (isLocalDevAdmin ? { email: "local-admin" } : null);

  // Redirect authenticated users away from login page
  if (pathname === "/dashboard/login" && effectiveUser) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Protect dashboard routes (except login)
  if (pathname.startsWith("/dashboard") && pathname !== "/dashboard/login" && !effectiveUser) {
    return NextResponse.redirect(new URL("/dashboard/login", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
