"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { saveSiteContent } from "@/lib/site-content";

export interface OrganizationSettings {
  organizationName: string;
  shortName: string;
  tagline: string;
  motto: string;
  foundedYear: number;
  volunteerApplicationsOpen: boolean;
  studentRegistrationOpen: boolean;
  supportEmail: string;
  emergencyPhone: string;
}

export async function updateOrganizationSettings(settings: OrganizationSettings) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { error: "Database not configured" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isDev = process.env.NODE_ENV === "development";
  const isSuperAdmin = profile?.role === "super_admin";

  if (!isSuperAdmin && !isDev) {
    return { error: "Unauthorized. Super Admin role required." };
  }

  const result = await saveSiteContent("settings", settings);
  if (result.error) {
    return { error: result.error };
  }

  // Insert audit log
  try {
    await supabase.from("audit_logs").insert({
      admin_id: user.id,
      action: "update_settings",
      entity_type: "system_settings",
      entity_id: "global",
      metadata: settings,
    });
  } catch {
    // Audit log table might fail if RLS triggers or user profile not linked, safe to continue
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function changeAdminPassword(formData: FormData) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { error: "Database not configured" };

  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (newPassword.length < 6) {
    return { error: "Password must be at least 6 characters long." };
  }
  if (newPassword !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return { error: error.message };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    try {
      await supabase.from("audit_logs").insert({
        admin_id: user.id,
        action: "change_password",
        entity_type: "auth_user",
        entity_id: user.id,
      });
    } catch {
      // ignore
    }
  }

  return { success: true };
}

export async function revalidateAllCaches() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { error: "Database not configured" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/programs");
  revalidatePath("/announcements");
  revalidatePath("/impact");
  revalidatePath("/gallery");
  revalidatePath("/team");
  revalidatePath("/contact");

  try {
    await supabase.from("audit_logs").insert({
      admin_id: user.id,
      action: "flush_cache",
      entity_type: "cache",
      entity_id: "global",
    });
  } catch {
    // ignore
  }

  return { success: true, timestamp: new Date().toISOString() };
}
