import type { Metadata } from "next";
import { ProgramBrowser, type BrowseProgram } from "@/components/student/program-browser";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Volunteer Activities",
  description: "Browse, search, and join GBT volunteer activities.",
  robots: { index: false },
};

export default async function StudentProgramsPage() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: programs } = await supabase
    .from("programs")
    .select("id, title, category, description, location, start_date, end_date, status")
    .order("start_date", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-600">Activities</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-forest-950">Volunteer Activities</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Find a volunteer activity that matches your skills and your community.
        </p>
      </div>
      <ProgramBrowser programs={(programs ?? []) as BrowseProgram[]} />
    </div>
  );
}
