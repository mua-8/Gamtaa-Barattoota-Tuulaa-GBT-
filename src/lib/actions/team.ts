"use server";

import { getSupabaseServerClient } from "../supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export interface TeamMemberPayload {
  name: string;
  position: string;
  photo_url?: string;
  university?: string;
  department?: string;
  education_level?: string;
  is_active: boolean;
  display_order: number;
}

export async function createTeamMember(payload: TeamMemberPayload) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { error: "Database not configured" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("team_members").insert({
    ...payload,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/team");
  redirect("/admin/team");
}

export async function updateTeamMember(id: string, payload: TeamMemberPayload) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { error: "Database not configured" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("team_members")
    .update(payload)
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/team");
  redirect("/admin/team");
}

export async function deleteTeamMember(id: string) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { error: "Database not configured" };

  const { error } = await supabase.from("team_members").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/team");
  redirect("/admin/team");
}
