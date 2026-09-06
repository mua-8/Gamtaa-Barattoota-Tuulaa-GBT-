"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { saveSiteContent } from "@/lib/site-content";

export async function updateAboutContent(content: any) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { error: "Authentication error" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", (await supabase.auth.getUser()).data.user?.id)
    .single();

  const isDev = process.env.NODE_ENV === "development";
  const isSuperAdmin = profile?.role === "super_admin";

  if (!isSuperAdmin && !isDev) {
    return { error: "Unauthorized. Super Admin role required." };
  }

  const result = await saveSiteContent("about", content);
  if (result.error) {
    console.error("About content update error:", result.error);
    return { error: "Failed to update about content: " + result.error };
  }

  revalidatePath("/about");
  revalidatePath("/admin/about");
  
  return { success: true };
}
