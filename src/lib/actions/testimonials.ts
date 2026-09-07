"use server";

import { getSupabaseServerClient } from "../supabase/server";
import { revalidatePath } from "next/cache";

export interface TestimonialPayload {
  name: string;
  role?: string;
  organization?: string;
  photo_url?: string;
  quote: string;
  is_published: boolean;
}

export async function createTestimonial(payload: TestimonialPayload) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { error: "Database not configured" };

  const { error } = await supabase.from("testimonials").insert(payload);
  if (error) return { error: error.message };

  revalidatePath("/admin/testimonials");
  revalidatePath("/");
  revalidatePath("/about");
  return { success: true };
}

export async function updateTestimonial(id: string, payload: TestimonialPayload) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { error: "Database not configured" };

  const { error } = await supabase.from("testimonials").update(payload).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/testimonials");
  revalidatePath("/");
  revalidatePath("/about");
  return { success: true };
}

export async function deleteTestimonial(id: string) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { error: "Database not configured" };

  const { error } = await supabase.from("testimonials").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/testimonials");
  revalidatePath("/");
  revalidatePath("/about");
  return { success: true };
}
