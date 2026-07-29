import { NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";
import { getSellerSubdomain } from "@/lib/urls";

const DEMO_LANDING_HASHES = {
  claro: "ohxZn08",
  entel: "GA9CU9o",
  movistar: "cJKWAcQ",
  vtr: "oOn6PS8",
  wom: "v1Lz_Yo",
};

export async function proxy(request) {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") || request.nextUrl.hostname;
  const sellerSubdomain = getSellerSubdomain(hostname);

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

  const isPublicRootPath = pathname === "/";
  const isProtectedOrSystemPath =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/registro") ||
    pathname.startsWith("/p/");

  if (sellerSubdomain?.startsWith("demo-") && isPublicRootPath) {
    const companySlug = sellerSubdomain.slice("demo-".length);
    const landingHash = DEMO_LANDING_HASHES[companySlug];
    if (landingHash) {
      const rewriteUrl = request.nextUrl.clone();
      rewriteUrl.pathname = `/landings/${landingHash}.html`;
      rewriteUrl.searchParams.set("slug", sellerSubdomain);
      return NextResponse.rewrite(rewriteUrl);
    }
  }

  if (sellerSubdomain && isPublicRootPath && !isProtectedOrSystemPath) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/p/${sellerSubdomain}`;
    return NextResponse.rewrite(rewriteUrl);
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
