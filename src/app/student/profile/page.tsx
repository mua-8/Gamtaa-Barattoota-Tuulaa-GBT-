import type { Metadata } from "next";
import { ProfileEditor, type ProfileInitial } from "@/components/student/profile-editor";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "My Profile",
  description: "View and update your GBT volunteer profile, skills, availability, and bio.",
  robots: { index: false },
};

export default async function ProfilePage() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, avatar_url")
    .eq("id", user.id)
    .single();
  const { data: studentProfile } = await supabase
    .from("student_profiles")
    .select("*")
    .eq("profile_id", user.id)
    .single();
  const { data: skills } = studentProfile
    ? await supabase
        .from("student_skills")
        .select("skill")
        .eq("student_profile_id", studentProfile.id)
    : { data: [] as { skill: string }[] };

  const initial: ProfileInitial = {
    userId: user.id,
    fullName: profile?.full_name ?? "",
    phone: profile?.phone ?? "",
    avatarUrl: profile?.avatar_url ?? null,
    studentProfile,
    skills: (skills ?? []).map((s) => s.skill),
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-600">My Profile</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-forest-950">Your profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Keep your information current so we can match you with the right programs.
        </p>
      </div>
      <ProfileEditor initial={initial} />
    </div>
  );
}
