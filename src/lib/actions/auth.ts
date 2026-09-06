"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type AuthResult =
  | { ok: true; needsVerification?: boolean }
  | { ok: false; error: string };

const NOT_CONFIGURED =
  "The backend is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (see .env.example).";

async function getClient(): Promise<SupabaseClient | null> {
  return getSupabaseServerClient();
}

async function origin(): Promise<string> {
  const h = await headers();
  return (
    h.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  );
}

export async function loginAction(formData: FormData): Promise<AuthResult> {
  const supabase = await getClient();
  if (!supabase) return { ok: false, error: NOT_CONFIGURED };

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nextParam = String(formData.get("next") ?? "");

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: error.message };

  let destination = "/student/dashboard";

  // Only redirect to admin portal if explicitly requested via the admin portal link
  if (nextParam && nextParam.startsWith("/admin")) {
    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profile && (profile.role === "admin" || profile.role === "super_admin")) {
        destination = nextParam;
      } else {
        destination = "/student/dashboard";
      }
    }
  } else if (nextParam && nextParam.startsWith("/") && !nextParam.startsWith("/login")) {
    destination = nextParam;
  }

  revalidatePath("/", "layout");
  redirect(destination.startsWith("/") ? destination : "/student/dashboard");
}

export async function registerAction(formData: FormData): Promise<AuthResult> {
  const supabase = await getClient();
  if (!supabase) return { ok: false, error: NOT_CONFIGURED };

  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (fullName.length < 2) return { ok: false, error: "Please enter your full name." };
  if (password.length < 8)
    return { ok: false, error: "Password must be at least 8 characters." };

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, phone },
      emailRedirectTo: `${await origin()}/auth/callback?next=/join`,
    },
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/", "layout");
  if (data.session) {
    // Email confirmation disabled in the Supabase project.
    redirect("/join");
  }
  return { ok: true, needsVerification: true };
}

export async function logoutAction(): Promise<void> {
  const supabase = await getClient();
  if (supabase) await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function forgotPasswordAction(formData: FormData): Promise<AuthResult> {
  const supabase = await getClient();
  if (!supabase) return { ok: false, error: NOT_CONFIGURED };

  const email = String(formData.get("email") ?? "").trim();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await origin()}/auth/callback?next=/forgot-password?step=update`,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function updatePasswordAction(formData: FormData): Promise<AuthResult> {
  const supabase = await getClient();
  if (!supabase) return { ok: false, error: NOT_CONFIGURED };

  const password = String(formData.get("password") ?? "");
  if (password.length < 8)
    return { ok: false, error: "Password must be at least 8 characters." };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
