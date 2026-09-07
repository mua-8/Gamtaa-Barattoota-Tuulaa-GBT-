"use server";

import { getSupabaseServerClient } from "../supabase/server";
import { revalidatePath } from "next/cache";

export interface GalleryPayload {
  title?: string;
  description?: string;
  image_url: string;
  category?: string;
  display_order: number;
  is_published: boolean;
}

export async function createGalleryItem(payload: GalleryPayload) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { error: "Database not configured" };

  const { error } = await supabase.from("gallery_items").insert(payload);
  if (error) return { error: error.message };

  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  return { success: true };
}

export async function updateGalleryItem(id: string, payload: GalleryPayload) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { error: "Database not configured" };

  const { error } = await supabase.from("gallery_items").update(payload).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  return { success: true };
}

export async function deleteGalleryItem(id: string) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { error: "Database not configured" };

  const { error } = await supabase.from("gallery_items").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  return { success: true };
}
