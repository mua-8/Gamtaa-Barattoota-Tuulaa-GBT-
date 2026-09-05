"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export interface ApplicationPayload {
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  avatarUrl: string | null;
  currentLocation: string;
  homeCommunity: string;
  university: string;
  faculty: string;
  department: string;
  yearOfStudy: string;
  studentId: string;
  bio: string;
  skills: string[];
  serviceAreas: string[];
  subjects: string[];
  educationLevels: string[];
  teachingExperience: string;
  motivation: string;
  availabilityStart: string;
  availabilityEnd: string;
  preferredLocation: string;
}

export type ApplicationResult =
  | {
      ok: true;
      application: {
        application_number: string;
        status: string;
        submitted_at: string;
      };
    }
  | { ok: false; error: string };

/**
 * Creates/updates the signed-in student's profile data and submits an
 * application. All writes go through the user's own session, so RLS
 * guarantees students can only touch their own rows.
 */
export async function submitApplication(
  payload: ApplicationPayload
): Promise<ApplicationResult> {
  if (!isSupabaseConfigured) {
    return { ok: false, error: "The backend is not configured. See .env.example." };
  }
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { ok: false, error: "The backend is not configured." };

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { ok: false, error: "You must be signed in to submit an application." };
  }

  // 1) Core profile
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: payload.fullName,
      phone: payload.phone,
      avatar_url: payload.avatarUrl,
    })
    .eq("id", user.id);
  if (profileError) return { ok: false, error: profileError.message };

  // 2) Student profile (upsert on profile_id)
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
      },
      { onConflict: "profile_id" }
    )
    .select()
    .single();
  if (spError || !studentProfile) {
    return { ok: false, error: spError?.message ?? "Could not save your student profile." };
  }

  // 3) Skills (replace-all)
  const { error: deleteError } = await supabase
    .from("student_skills")
    .delete()
    .eq("student_profile_id", studentProfile.id);
  if (deleteError) return { ok: false, error: deleteError.message };

  if (payload.skills.length > 0) {
    const { error: skillsError } = await supabase.from("student_skills").insert(
      payload.skills.map((skill) => ({
        student_profile_id: studentProfile.id,
        skill,
      }))
    );
    if (skillsError) return { ok: false, error: skillsError.message };
  }

  // 4) One active application per student
  const { data: existing } = await supabase
    .from("applications")
    .select("id")
    .eq("student_profile_id", studentProfile.id)
    .limit(1);
  if (existing && existing.length > 0) {
    return { ok: false, error: "You have already submitted an application." };
  }

  // 5) Application (number assigned by a database trigger)
  const { data: application, error: appError } = await supabase
    .from("applications")
    .insert({
      student_profile_id: studentProfile.id,
      motivation: payload.motivation,
      teaching_experience: payload.teachingExperience || null,
      availability_start: payload.availabilityStart || null,
      availability_end: payload.availabilityEnd || null,
      preferred_location: payload.preferredLocation || null,
      preferred_service_areas: payload.serviceAreas,
      subjects: payload.subjects,
      education_levels: payload.educationLevels,
    })
    .select("application_number, status, submitted_at")
    .single();
  if (appError || !application) {
    return { ok: false, error: appError?.message ?? "Could not submit your application." };
  }

  return { ok: true, application };
}
