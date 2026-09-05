"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function updateHomeContent(content: any) {
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

  const { error } = await supabase
    .from("site_content")
    .upsert(
      { page_slug: "home", content },
      { onConflict: "page_slug" }
    );

  if (error) {
    console.error("Home content update error:", error);
    return { error: "Failed to update home content. Please check database permissions." };
  }

  // Clear cache for the home page
  revalidatePath("/");
  
  return { success: true };
}
