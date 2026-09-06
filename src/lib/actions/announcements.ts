"use server";

import { getSupabaseServerClient } from "../supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { formatAnnouncementContent } from "../announcements-util";

export interface AnnouncementPayload {
  title: string;
  content: string;
  is_published: boolean;
  image_url?: string;
}

export async function createAnnouncement(payload: AnnouncementPayload) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { error: "Database not configured" };

  const contentWithImage = formatAnnouncementContent(payload.content, payload.image_url);

  // Attempt insert with image_url column if supported
  let { error } = await supabase.from("announcements").insert({
    title: payload.title.trim(),
    content: contentWithImage,
    is_published: payload.is_published,
    image_url: payload.image_url ? payload.image_url.trim() : null,
  });

  // Gracefully fallback if image_url column doesn't exist in Postgres schema
  if (error && (error.code === "PGRST204" || error.message?.includes("image_url"))) {
    const fallback = await supabase.from("announcements").insert({
      title: payload.title.trim(),
      content: contentWithImage,
      is_published: payload.is_published,
    });
    error = fallback.error;
  }

  if (error) return { error: error.message };

  revalidatePath("/admin/announcements");
  revalidatePath("/");
  revalidatePath("/announcements");
  redirect("/admin/announcements");
}

export async function updateAnnouncement(id: string, payload: AnnouncementPayload) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { error: "Database not configured" };

  const contentWithImage = formatAnnouncementContent(payload.content, payload.image_url);

  // Attempt update with image_url column if supported
  let { error } = await supabase.from("announcements").update({
    title: payload.title.trim(),
    content: contentWithImage,
    is_published: payload.is_published,
    image_url: payload.image_url ? payload.image_url.trim() : null,
  }).eq("id", id);

  // Gracefully fallback if image_url column doesn't exist in Postgres schema
  if (error && (error.code === "PGRST204" || error.message?.includes("image_url"))) {
    const fallback = await supabase.from("announcements").update({
      title: payload.title.trim(),
      content: contentWithImage,
      is_published: payload.is_published,
    }).eq("id", id);
    error = fallback.error;
  }

  if (error) return { error: error.message };

  revalidatePath("/admin/announcements");
  revalidatePath("/");
  revalidatePath("/announcements");
  redirect("/admin/announcements");
}

export async function deleteAnnouncement(id: string) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { error: "Database not configured" };

  const { error } = await supabase.from("announcements").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/announcements");
  revalidatePath("/");
  revalidatePath("/announcements");
  redirect("/admin/announcements");
}
