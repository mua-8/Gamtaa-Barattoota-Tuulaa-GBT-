"use server";

import { getSupabaseServerClient } from "../supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export interface AnnouncementPayload {
  title: string;
  content: string;
  is_published: boolean;
}

export async function createAnnouncement(payload: AnnouncementPayload) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { error: "Database not configured" };

  const { error } = await supabase.from("announcements").insert(payload);
  if (error) return { error: error.message };

  revalidatePath("/admin/announcements");
  redirect("/admin/announcements");
}

export async function updateAnnouncement(id: string, payload: AnnouncementPayload) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { error: "Database not configured" };

  const { error } = await supabase.from("announcements").update(payload).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/announcements");
  redirect("/admin/announcements");
}

export async function deleteAnnouncement(id: string) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { error: "Database not configured" };

  const { error } = await supabase.from("announcements").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/announcements");
  redirect("/admin/announcements");
}
