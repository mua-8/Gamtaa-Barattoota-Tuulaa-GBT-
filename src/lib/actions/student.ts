"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type StudentActionResult =
  | { ok: true }
  | { ok: false; error: string };

async function requireUser() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return { supabase, user };
}

export interface StudentProfilePayload {
  fullName: string;
  phone: string;
  avatarUrl: string | null;
  gender: string;
  dateOfBirth: string;
  currentLocation: string;
  homeCommunity: string;
  university: string;
  faculty: string;
  department: string;
  yearOfStudy: string;
  studentId: string;
  bio: string;
  availabilityStart: string;
  availabilityEnd: string;
  skills: string[];
}

/**
 * Updates only student-editable fields. Role, application status,
 * verification data and service hours are never writable here.
 */
export async function updateStudentProfile(
  payload: StudentProfilePayload
): Promise<StudentActionResult> {
  const base = await requireUser();
  if (!base) return { ok: false, error: "You must be signed in to continue." };
  const { supabase, user } = base;

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: payload.fullName,
      phone: payload.phone,
      avatar_url: payload.avatarUrl,
    })
    .eq("id", user.id);
  if (profileError) return { ok: false, error: profileError.message };

  const { data: studentProfile, error: spError } = await supabase
    .from("student_profiles")
    .upsert(
      {
        profile_id: user.id,
        gender: payload.gender || null,
        date_of_birth: payload.dateOfBirth || null,
        phone: payload.phone || null,
        current_location: payload.currentLocation || null,
        home_community: payload.homeCommunity || null,
        university: payload.university || null,
        faculty: payload.faculty || null,
        department: payload.department || null,
        year_of_study: payload.yearOfStudy || null,
        student_id: payload.studentId || null,
        bio: payload.bio || null,
        availability_start: payload.availabilityStart || null,
        availability_end: payload.availabilityEnd || null,
      },
      { onConflict: "profile_id" }
    )
    .select()
    .single();
  if (spError || !studentProfile)
    return { ok: false, error: spError?.message ?? "Could not save your profile." };

  const { error: delError } = await supabase
    .from("student_skills")
    .delete()
    .eq("student_profile_id", studentProfile.id);
  if (delError) return { ok: false, error: delError.message };

  if (payload.skills.length > 0) {
    const { error: insError } = await supabase.from("student_skills").insert(
      payload.skills.map((skill) => ({
        student_profile_id: studentProfile.id,
        skill,
      }))
    );
    if (insError) return { ok: false, error: insError.message };
  }

  revalidatePath("/student", "layout");
  return { ok: true };
}

/** Students submit pending records only — verification is admin-only. */
export async function submitServiceRecord(formData: FormData): Promise<StudentActionResult> {
  const base = await requireUser();
  if (!base) return { ok: false, error: "You must be signed in to continue." };
  const { supabase, user } = base;

  const activity = String(formData.get("activity") ?? "").trim();
  const hours = Number(String(formData.get("hours") ?? ""));
  const date = String(formData.get("date") ?? "");
  const programId = String(formData.get("program_id") ?? "");

  if (activity.length < 3) return { ok: false, error: "Describe the activity." };
  if (!Number.isFinite(hours) || hours <= 0 || hours > 24)
    return { ok: false, error: "Hours must be between 0 and 24." };

  const { error } = await supabase.from("service_records").insert({
    student_id: user.id,
    program_id: programId || null,
    date: date || new Date().toISOString().slice(0, 10),
    activity,
    location: String(formData.get("location") ?? "").trim() || null,
    hours,
    description: String(formData.get("description") ?? "").trim() || null,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/student", "layout");
  revalidatePath("/admin/service-records");
  return { ok: true };
}

/** Self-enrollment; RLS forces status='registered' and own student_id. */
export async function joinProgram(formData: FormData): Promise<StudentActionResult> {
  const base = await requireUser();
  if (!base) return { ok: false, error: "You must be signed in to continue." };
  const { supabase, user } = base;

  const programId = String(formData.get("program_id") ?? "");
  const { error } = await supabase.from("program_participants").insert({
    program_id: programId,
    student_id: user.id,
  });
  if (error) {
    if (error.code === "23505")
      return { ok: false, error: "You have already joined this program." };
    return { ok: false, error: error.message };
  }
  revalidatePath("/student", "layout");
  return { ok: true };
}

export async function markNotificationRead(arg: FormData | string): Promise<StudentActionResult> {
  const base = await requireUser();
  if (!base) return { ok: false, error: "You must be signed in to continue." };
  const { supabase, user } = base;
  const id = typeof arg === "string" ? arg : String(arg.get("id") ?? "");
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/student", "layout");
  revalidatePath("/student/dashboard");
  revalidatePath("/student/notifications");
  return { ok: true };
}

export async function markAllNotificationsRead(): Promise<StudentActionResult> {
  const base = await requireUser();
  if (!base) return { ok: false, error: "You must be signed in to continue." };
  const { supabase, user } = base;
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", user.id)
    .eq("read", false);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/student", "layout");
  revalidatePath("/student/dashboard");
  revalidatePath("/student/notifications");
  return { ok: true };
}

export type SimpleApplicationResult =
  | { ok: true; application: { application_number: string; status: string; submitted_at: string } }
  | { ok: false; needsVerification: true }
  | { ok: false; error: string };

/**
 * One-form student application: creates the account if needed (email
 * confirmation is optional), then stores profile + application.
 */
export async function submitSimpleApplication(formData: FormData): Promise<SimpleApplicationResult> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { ok: false, error: "The backend is not configured." };

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const university = String(formData.get("university") ?? "").trim();
  const department = String(formData.get("department") ?? "").trim();
  const yearOfStudy = String(formData.get("year_of_study") ?? "").trim();
  const homeCommunity = String(formData.get("home_community") ?? "").trim();
  const motivation = String(formData.get("motivation") ?? "").trim();
  const agreed = formData.get("agreed") === "on";
  let areas: string[] = [];
  try {
    areas = JSON.parse(String(formData.get("areas") ?? "[]"));
  } catch {
    areas = [];
  }

  if (fullName.length < 2) return { ok: false, error: "Please enter your full name." };
  if (!university || !department || !yearOfStudy || !homeCommunity)
    return { ok: false, error: "Please complete your study details." };
  if (motivation.length < 30)
    return { ok: false, error: "Tell us a little more about your motivation (30+ characters)." };
  if (!agreed) return { ok: false, error: "Please accept the participation guidelines." };

  let {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (!email || password.length < 8)
      return { ok: false, error: "Create your account first: a valid email and a password of 8+ characters." };
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, phone } },
    });
    if (error) return { ok: false, error: error.message };
    if (!data.session || !data.user) return { ok: false, needsVerification: true };
    user = data.user;
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ full_name: fullName, phone: phone || null })
    .eq("id", user.id);
  if (profileError) return { ok: false, error: profileError.message };

  const { data: studentProfile, error: spError } = await supabase
    .from("student_profiles")
    .upsert(
      {
        profile_id: user.id,
        phone: phone || null,
        home_community: homeCommunity,
        university,
        department,
        year_of_study: yearOfStudy,
      },
      { onConflict: "profile_id" }
    )
    .select()
    .single();
  if (spError || !studentProfile)
    return { ok: false, error: spError?.message ?? "Could not save your student details." };

  const { data: existing } = await supabase
    .from("applications")
    .select("application_number, status, submitted_at")
    .eq("student_profile_id", studentProfile.id)
    .limit(1);
  if (existing && existing.length > 0)
    return { ok: true, application: existing[0] };

  const { data: application, error: appError } = await supabase
    .from("applications")
    .insert({
      student_profile_id: studentProfile.id,
      motivation,
      preferred_location: homeCommunity,
      preferred_service_areas: areas,
    })
    .select("application_number, status, submitted_at")
    .single();
  if (appError || !application)
    return { ok: false, error: appError?.message ?? "Could not submit your application." };

  revalidatePath("/student", "layout");
  return { ok: true, application };
}
