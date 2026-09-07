import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isSupabaseConfigured, supabaseEnv, COOKIE_OPTIONS } from "./config";

/** Routes that require a signed-in user. */
export const PROTECTED_PREFIXES = ["/student", "/admin"];

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

  // Check if any Supabase authentication cookies are present
  const allCookies = request.cookies.getAll();
  const hasAuthCookie = allCookies.some(
    (c) => c.name.includes("auth-token") || (c.name.startsWith("sb-") && c.name.endsWith("-auth-token"))
  );

  // Fast-path 1: Unprotected public page without auth cookies -> 0ms instant response
  if (!isProtected && !hasAuthCookie) {
    return NextResponse.next({ request });
  }

  // Fast-path 2: Protected route without auth cookies -> Instant redirect to login without network lag
  if (isProtected && !hasAuthCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (!isSupabaseConfigured) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  try {
    const supabase = createServerClient(supabaseEnv.url, supabaseEnv.anonKey, {
      cookieOptions: { ...COOKIE_OPTIONS },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: any[]) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          supabaseResponse = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }
        },
      },
    });

    // Verify user only when accessing protected routes or checking existing session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (isProtected && !user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  } catch (err) {
    // If Supabase check errors on protected route, redirect to login
    if (isProtected) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
