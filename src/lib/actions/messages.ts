"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type MessageStatus = "new" | "read" | "replied" | "archived";

export async function updateMessageStatus(id: string, status: MessageStatus) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { error: "Not authenticated" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Use admin client if available to ensure RLS does not block
  const admin = getSupabaseAdminClient() || supabase;
  const { error } = await admin
    .from("contact_messages")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error("Error updating message status:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/messages");
  revalidatePath("/admin");
  return { success: true };
}

export async function deleteMessage(id: string) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { error: "Not authenticated" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const admin = getSupabaseAdminClient() || supabase;
  const { error } = await admin
    .from("contact_messages")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting message:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/messages");
  revalidatePath("/admin");
  return { success: true };
}
