import { NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";
import { getRootDomain, getSellerSubdomain } from "@/lib/urls";
import { getOfficialDemoCompanySlug, getOfficialDemoPath } from "@/lib/demo-landings";

function buildRootUrl(request, pathname) {
  const appOrigin = String(process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");
  if (appOrigin) {
    return new URL(pathname, `${appOrigin}/`);
  }

  const rootDomain = getRootDomain();
  if (rootDomain) {
    return new URL(`${request.nextUrl.protocol}//${rootDomain}${pathname}`);
  }

  return new URL(pathname, request.url);
}

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

  // Los subdominios de vendedores deben servir solo la landing pública.
  // Registro, auth y dashboard viven siempre en el dominio principal para
  // evitar desalineaciones de sesión y redirecciones inconsistentes.
  if (
    sellerSubdomain &&
    (pathname.startsWith("/dashboard") || pathname.startsWith("/registro") || pathname.startsWith("/auth"))
  ) {
    return NextResponse.redirect(buildRootUrl(request, pathname));
  }

  if (sellerSubdomain?.startsWith("demo-") && isPublicRootPath) {
    const companySlug = getOfficialDemoCompanySlug(sellerSubdomain);
    const landingPath = getOfficialDemoPath(companySlug);
    if (landingPath) {
      const rewriteUrl = request.nextUrl.clone();
      rewriteUrl.pathname = landingPath;
      rewriteUrl.searchParams.set("slug", sellerSubdomain);
      return NextResponse.rewrite(rewriteUrl);
    }
  }

  if (sellerSubdomain && isPublicRootPath && !isProtectedOrSystemPath) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/p/${sellerSubdomain}`;
    return NextResponse.rewrite(rewriteUrl);
  }

  if (pathname === "/landings/mundo.html") {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = "/p/demo-mundo";
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
