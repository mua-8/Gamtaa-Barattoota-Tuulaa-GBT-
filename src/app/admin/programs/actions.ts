"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function getPrograms() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("programs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching programs:", error.message || error);
    return [];
  }

  return data || [];
}

export async function getProgram(id: string) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("programs")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching program:", error.message || error);
    return null;
  }

  return data;
}

export async function upsertProgram(program: any) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { error: "Authentication error" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", (await supabase.auth.getUser()).data.user?.id)
    .single();

  const isDev = process.env.NODE_ENV === "development";
  if (!isDev && profile?.role !== "super_admin") {
    return { error: "Unauthorized. Super Admin role required." };
  }

  // Generate slug from title if not provided
  let slug = program.slug;
  if (!slug && program.title) {
    slug = program.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  }

  // Ensure payload conforms to public.programs table schema
  const payload: any = {
    title: program.title,
    slug,
    description: program.description || program.short_description || "",
    category: program.category,
    image_url: program.image_url,
    status: program.status || "active",
  };
  if (program.id) payload.id = program.id;
  if (program.start_date) payload.start_date = program.start_date;
  if (program.end_date) payload.end_date = program.end_date;
  if (program.location) payload.location = program.location;
  if (program.target_audience) payload.target_audience = program.target_audience;
  if (program.objectives) payload.objectives = program.objectives;

  const { error } = await supabase
    .from("programs")
    .upsert(payload)
    .select()
    .single();

  if (error) {
    console.error("Program upsert error:", error.message || error);
    return { error: error.message || "Failed to save program." };
  }

  revalidatePath("/programs");
  revalidatePath("/admin/programs");
  revalidatePath("/");
  
  return { success: true };
}

export async function deleteProgram(id: string) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { error: "Authentication error" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", (await supabase.auth.getUser()).data.user?.id)
    .single();

  const isDev = process.env.NODE_ENV === "development";
  if (!isDev && profile?.role !== "super_admin") {
    return { error: "Unauthorized. Super Admin role required." };
  }

  const { error } = await supabase
    .from("programs")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Program delete error:", error);
    return { error: "Failed to delete program." };
  }

  revalidatePath("/programs");
  revalidatePath("/admin/programs");
  revalidatePath("/");
  
  return { success: true };
}
