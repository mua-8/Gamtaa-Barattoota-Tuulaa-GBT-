import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isServiceRoleConfigured, supabaseEnv } from "./config";

/**
 * Service-role client — SERVER-ONLY. Bypasses RLS; used for anonymous
 * writes such as contact messages. Throws if imported in the browser.
 */
export function getSupabaseAdminClient(): SupabaseClient | null {
  if (typeof window !== "undefined") {
    throw new Error("getSupabaseAdminClient must not be used on the client.");
  }
  if (!isServiceRoleConfigured) return null;
  return createClient(supabaseEnv.url, supabaseEnv.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
