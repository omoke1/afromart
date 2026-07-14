import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const ADMIN_PREFIX = "/admin";
// Customer-facing routes that require a signed-in user
const PROTECTED_PREFIXES = ["/account", "/checkout"];

export async function middleware(request: NextRequest) {
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

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const url = request.nextUrl.clone();
    if (isAdmin) {
      url.pathname = "/admin/login";
    } else {
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
    }
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/checkout/:path*"],
};
