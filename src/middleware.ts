import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "am_session";
const ADMIN_PREFIX = "/admin";
// Customer-facing routes that require a signed-in user
const PROTECTED_PREFIXES = ["/account", "/checkout"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdmin = pathname.startsWith(ADMIN_PREFIX);
  const isProtected =
    isAdmin || PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

  if (!isProtected) {
    return NextResponse.next();
  }

  // Allow access to the admin login page
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Fast gate: a session cookie must exist. Real session validation happens
  // in the account/admin layouts and API routes, which check the sessions
  // table before trusting it.
  if (!request.cookies.has(SESSION_COOKIE)) {
    const url = request.nextUrl.clone();
    if (isAdmin) {
      url.pathname = "/admin/login";
    } else {
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
    }
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/checkout/:path*"],
};
