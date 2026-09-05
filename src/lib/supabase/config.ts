/**
 * Supabase configuration.
 *
 * NEXT_PUBLIC_* values are safe for the browser (anon key + RLS protect data).
 * SUPABASE_SERVICE_ROLE_KEY must NEVER be read in client components — it is
 * only used in src/lib/supabase/admin.ts, which throws in the browser.
 */

export const supabaseEnv = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
} as const;

export const isSupabaseConfigured = Boolean(
  supabaseEnv.url && supabaseEnv.anonKey
);

export const isServiceRoleConfigured = Boolean(supabaseEnv.serviceRoleKey);

/**
 * Cookies must work both top-level (external tunnel) and embedded in the
 * Arena preview iframe (cross-site context) → SameSite=None + Secure +
 * Partitioned (CHIPS). Localhost is treated as secure by browsers.
 */
export const COOKIE_OPTIONS = {
  sameSite: "none",
  secure: true,
  partitioned: true,
} as const;
