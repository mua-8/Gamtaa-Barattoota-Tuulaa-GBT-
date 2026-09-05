"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabaseEnv, COOKIE_OPTIONS } from "./config";

let client: SupabaseClient | null = null;

/** Browser client (anon key). Returns null when env vars are missing. */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!client) {
    client = createBrowserClient(supabaseEnv.url, supabaseEnv.anonKey, {
      cookieOptions: { ...COOKIE_OPTIONS },
    });
  }
  return client;
}
