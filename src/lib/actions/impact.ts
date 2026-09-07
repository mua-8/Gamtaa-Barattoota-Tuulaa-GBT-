"use server";

import { getSupabaseServerClient } from "../supabase/server";
import { revalidatePath } from "next/cache";

export interface ImpactPayload {
  metric_key: string;
  metric_value: number;
  metric_label: string;
}

export async function createImpact(payload: ImpactPayload) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { error: "Database not configured" };

  const { error } = await supabase.from("impact_metrics").insert(payload);
  if (error) return { error: error.message };

  revalidatePath("/admin/impact");
  revalidatePath("/impact");
  revalidatePath("/");
  return { success: true };
}

export async function updateImpact(id: string, payload: ImpactPayload) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { error: "Database not configured" };

  const { error } = await supabase.from("impact_metrics").update(payload).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/impact");
  revalidatePath("/impact");
  revalidatePath("/");
  return { success: true };
}

export async function deleteImpact(id: string) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { error: "Database not configured" };

  const { error } = await supabase.from("impact_metrics").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/impact");
  revalidatePath("/impact");
  revalidatePath("/");
  return { success: true };
}
