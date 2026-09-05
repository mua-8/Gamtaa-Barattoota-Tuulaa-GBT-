import type { Metadata } from "next";
import {
  ServiceHistory,
  type ProgramOption,
  type ServiceRecordRow,
} from "@/components/student/service-history";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Service History",
  description: "Submit service records and track verified volunteer hours.",
  robots: { index: false },
};

export default async function ServiceHistoryPage() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: records } = await supabase
    .from("service_records")
    .select("id, date, activity, location, hours, verification_status, programs(title)")
    .eq("student_id", user.id)
    .order("date", { ascending: false });

  const { data: programs } = await supabase
    .from("programs")
    .select("id, title")
    .order("title");

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-600">Service</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-forest-950">Service history</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Log your volunteer activities; verified hours build your service record.
        </p>
      </div>
      <ServiceHistory
        records={((records ?? []) as unknown) as ServiceRecordRow[]}
        programOptions={(programs ?? []) as ProgramOption[]}
      />
    </div>
  );
}
