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
  member_type?: string;
  intro?: string;
  bio?: string;
  is_active: boolean;
  display_order: number;
}

export interface FounderPayload {
  id?: string;
  name: string;
  position: string;
  photo_url?: string;
  intro?: string;
  bio?: string;
  university?: string;
  department?: string;
  education_level?: string;
  is_active: boolean;
}

export async function createTeamMember(payload: TeamMemberPayload) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { error: "Database not configured" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const insertData: any = {
    ...payload,
    member_type: payload.member_type || "program_team",
  };

  let { error } = await supabase.from("team_members").insert(insertData);

  if (error && (error.code === "PGRST204" || error.message?.includes("member_type"))) {
    delete insertData.member_type;
    delete insertData.intro;
    delete insertData.bio;
    const fb = await supabase.from("team_members").insert(insertData);
    error = fb.error;
  }

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/team");
  revalidatePath("/team");
  return { success: true };
}

export async function updateTeamMember(id: string, payload: TeamMemberPayload) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { error: "Database not configured" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const updateData: any = { ...payload };

  let { error } = await supabase
    .from("team_members")
    .update(updateData)
    .eq("id", id);

  if (error && (error.code === "PGRST204" || error.message?.includes("member_type"))) {
    delete updateData.member_type;
    delete updateData.intro;
    delete updateData.bio;
    const fb = await supabase.from("team_members").update(updateData).eq("id", id);
    error = fb.error;
  }

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/team");
  revalidatePath("/team");
  return { success: true };
}

export async function saveFounder(payload: FounderPayload) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { error: "Database not configured" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  let targetId = payload.id;

  if (!targetId) {
    // Check if founder already exists
    const { data: allMembers } = await supabase
      .from("team_members")
      .select("id, position, display_order");

    const found = allMembers?.find(
      (m: any) =>
        (m.position && m.position.toLowerCase().trim() === "founder") ||
        m.display_order === -999
    );
    if (found) targetId = found.id;
  }

  const fullData: any = {
    name: payload.name.trim(),
    position: payload.position.trim() || "Founder",
    photo_url: payload.photo_url || null,
    member_type: "founder",
    intro: payload.intro?.trim() || null,
    bio: payload.bio?.trim() || null,
    university: payload.university?.trim() || null,
    department: payload.department?.trim() || null,
    education_level: payload.education_level || "Graduate",
    is_active: payload.is_active,
    display_order: -999,
  };

  let error: any = null;

  if (targetId) {
    const res = await supabase.from("team_members").update(fullData).eq("id", targetId);
    error = res.error;

    if (error && (error.code === "PGRST204" || error.message?.includes("member_type") || error.message?.includes("intro") || error.message?.includes("bio"))) {
      const fallbackData = {
        name: payload.name.trim(),
        position: payload.position.trim() || "Founder",
        photo_url: payload.photo_url || null,
        department: JSON.stringify({
          intro: payload.intro?.trim() || "",
          bio: payload.bio?.trim() || "",
          department: payload.department?.trim() || "",
        }),
        university: payload.university?.trim() || null,
        education_level: payload.education_level || "Graduate",
        is_active: payload.is_active,
        display_order: -999,
      };
      const fb = await supabase.from("team_members").update(fallbackData).eq("id", targetId);
      error = fb.error;
    }
  } else {
    const res = await supabase.from("team_members").insert(fullData);
    error = res.error;

    if (error && (error.code === "PGRST204" || error.message?.includes("member_type") || error.message?.includes("intro") || error.message?.includes("bio"))) {
      const fallbackData = {
        name: payload.name.trim(),
        position: payload.position.trim() || "Founder",
        photo_url: payload.photo_url || null,
        department: JSON.stringify({
          intro: payload.intro?.trim() || "",
          bio: payload.bio?.trim() || "",
          department: payload.department?.trim() || "",
        }),
        university: payload.university?.trim() || null,
        education_level: payload.education_level || "Graduate",
        is_active: payload.is_active,
        display_order: -999,
      };
      const fb = await supabase.from("team_members").insert(fallbackData);
      error = fb.error;
    }
  }

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/team");
  revalidatePath("/team");
  revalidatePath("/");
  return { success: true };
}

export async function toggleFounderStatus(id: string, is_active: boolean) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { error: "Database not configured" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("team_members")
    .update({ is_active })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/team");
  revalidatePath("/team");
  return { ok: true };
}

export async function deleteTeamMember(id: string) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { error: "Database not configured" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("team_members").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/team");
  revalidatePath("/team");
  return { success: true };
}
