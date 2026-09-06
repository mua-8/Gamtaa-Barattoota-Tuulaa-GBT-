"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function updateApplicationStatus(
  applicationId: string,
  status: "approved" | "rejected" | "under_review" | "pending"
) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { error: "Database client not configured" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated. Please log in." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isDev = process.env.NODE_ENV === "development";
  if (!isDev && profile?.role !== "super_admin" && profile?.role !== "admin") {
    return { error: "Unauthorized. Admin role required." };
  }

  const { error } = await supabase
    .from("applications")
    .update({
      status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
    })
    .eq("id", applicationId);

  if (error) {
    console.error("Failed to update application status:", error);
    return { error: error.message || "Failed to update application status." };
  }

  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${applicationId}`);
  revalidatePath("/student", "layout");
  revalidatePath("/student/dashboard");
  revalidatePath("/student/notifications");
  revalidatePath("/student/profile");

  return { success: true, status };
}
