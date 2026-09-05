import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabaseEnv, COOKIE_OPTIONS } from "./config";

/**
 * Cookie-based server client for Server Components, Server Actions and
 * Route Handlers. Returns null when env vars are missing so pages can
 * render a friendly "backend not configured" state.
 */
export async function getSupabaseServerClient(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured) return null;
  const cookieStore = await cookies();

  return createServerClient(supabaseEnv.url, supabaseEnv.anonKey, {
    cookieOptions: { ...COOKIE_OPTIONS },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setAll(cookiesToSet: any[]) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component — session refresh is handled
          // by middleware instead.
        }
      },
    },
    global: {
      fetch: (url, options) => {
        return fetch(url, { ...options, cache: "no-store" });
      },
    },
  });
}
