import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "My Programs",
  description: "Your upcoming, active, and completed GBT programs with service hours.",
  robots: { index: false },
};

interface MyParticipation {
  status: string;
  program_id: string;
  completed_at: string | null;
  programs: {
    title: string;
    location: string | null;
    start_date: string | null;
    end_date: string | null;
  } | null;
}

export default async function MyProgramsPage() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: participations } = await supabase
    .from("program_participants")
    .select("status, program_id, completed_at, programs(title, location, start_date, end_date)")
    .eq("student_id", user.id)
    .neq("status", "withdrawn");

  const { data: records } = await supabase
    .from("service_records")
    .select("program_id, hours")
    .eq("student_id", user.id)
    .eq("verification_status", "verified");

  const hoursByProgram = new Map<string, number>();
  for (const r of records ?? []) {
    if (!r.program_id) continue;
    hoursByProgram.set(
      r.program_id,
      (hoursByProgram.get(r.program_id) ?? 0) + Number(r.hours)
    );
  }

  const parts = (participations ?? []) as unknown as MyParticipation[];
  const groups = [
    { title: "Upcoming", items: parts.filter((p) => p.status === "registered" || p.status === "accepted") },
    { title: "Active", items: parts.filter((p) => p.status === "active") },
    { title: "Completed", items: parts.filter((p) => p.status === "completed") },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-600">My Programs</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-forest-950">Your programs</h1>
        </div>
        <Button asChild variant="outline" className="border-forest-300 text-forest-900 hover:bg-forest-50">
          <Link href="/student/programs">Browse more</Link>
        </Button>
      </div>

      {groups.map((group) => (
        <section key={group.title} aria-labelledby={`mp-${group.title}`}>
          <h2 id={`mp-${group.title}`} className="font-display text-xl font-bold text-forest-950">
            {group.title}
          </h2>
          {group.items.length === 0 ? (
            <p className="mt-3 rounded-xl border border-dashed border-border bg-white p-6 text-sm text-muted-foreground">
              No {group.title.toLowerCase()} programs yet.
            </p>
          ) : (
            <ul className="mt-4 grid gap-5 lg:grid-cols-2">
              {group.items.map((p) => (
                <li key={p.program_id} className="rounded-xl border border-border bg-white p-6 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={`/student/programs/${p.program_id}`}
                      className="font-display text-lg font-bold text-forest-950 hover:text-forest-700"
                    >
                      {p.programs?.title ?? "Program"}
                    </Link>
                    <Badge className="border-transparent bg-forest-100 text-forest-800 hover:bg-forest-100 capitalize">
                      {p.status}
                    </Badge>
                  </div>
                  <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {p.programs?.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-forest-600" aria-hidden="true" />
                        {p.programs.location}
                      </span>
                    )}
                    {p.programs?.start_date && (
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-3 w-3 text-forest-600" aria-hidden="true" />
                        {p.programs.start_date} → {p.programs.end_date ?? "…"}
                      </span>
                    )}
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-sm">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
                      <Clock className="h-4 w-4 text-forest-600" aria-hidden="true" />
                      {hoursByProgram.get(p.program_id) ?? 0} verified hours
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">
                      {p.status === "completed"
                        ? p.completed_at
                          ? `Completed ${String(p.completed_at).slice(0, 10)}`
                          : "Completed"
                        : p.status === "active"
                          ? "In progress"
                          : "Not started"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
