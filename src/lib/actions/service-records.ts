"use server";

import { getSupabaseServerClient } from "../supabase/server";
import { revalidatePath } from "next/cache";

export async function verifyServiceRecord(id: string, status: "verified" | "rejected") {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { error: "Database not configured" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("service_records")
    .update({ 
      verification_status: status,
      verified_by: user.id,
      verified_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/service-records");
  return { success: true };
}
