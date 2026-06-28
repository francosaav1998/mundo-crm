import { NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request) {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // Redirect authenticated users away from login page
  if (pathname === "/dashboard/login" && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Protect dashboard routes (except login)
  if (pathname.startsWith("/dashboard") && pathname !== "/dashboard/login" && !user) {
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
