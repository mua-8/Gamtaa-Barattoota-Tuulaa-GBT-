import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  MapPin,
  Target,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { joinProgram } from "@/lib/actions/student";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Program Details",
  robots: { index: false },
};

const PARTICIPANT_LABELS: Record<string, string> = {
  registered: "Registered — awaiting acceptance",
  accepted: "Accepted",
  active: "Active",
  completed: "Completed",
  withdrawn: "Withdrawn",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentProgramDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await getSupabaseServerClient();
  if (!supabase) notFound();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: program } = await supabase
    .from("programs")
    .select("*")
    .eq("id", id)
    .single();
  if (!program) notFound();

  const { data: participation } = await supabase
    .from("program_participants")
    .select("status")
    .eq("program_id", id)
    .eq("student_id", user.id)
    .single();

  const { count: participantCount } = await supabase
    .from("program_participants")
    .select("id", { count: "exact", head: true })
    .eq("program_id", id)
    .neq("status", "withdrawn");

  return (
    <div className="space-y-8">
      <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
        <ol className="flex items-center gap-1.5">
          <li><Link href="/student/programs" className="hover:text-forest-800">Browse Volunteer Activities</Link></li>
          <li aria-hidden="true"><ChevronRight className="h-3 w-3" /></li>
          <li aria-current="page" className="font-semibold text-forest-800">{program.title}</li>
        </ol>
      </nav>

      <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="border-transparent bg-forest-100 text-forest-800 hover:bg-forest-100">
            {program.category ?? "General"}
          </Badge>
          <Badge className="border-transparent bg-gold-400 text-forest-950 hover:bg-gold-400 capitalize">
            {program.status}
          </Badge>
        </div>
        <h1 className="mt-4 font-display text-3xl font-bold text-forest-950">{program.title}</h1>
        <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
          {program.description}
        </p>

        <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
          <div className="flex gap-2.5">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" aria-hidden="true" />
            <div>
              <dt className="font-bold text-foreground">Location</dt>
              <dd className="text-muted-foreground">{program.location ?? "TBD"}</dd>
            </div>
          </div>
          <div className="flex gap-2.5">
            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" aria-hidden="true" />
            <div>
              <dt className="font-bold text-foreground">Dates</dt>
              <dd className="text-muted-foreground">
                {program.start_date ?? "TBD"} → {program.end_date ?? "…"}
              </dd>
            </div>
          </div>
          <div className="flex gap-2.5">
            <Users className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" aria-hidden="true" />
            <div>
              <dt className="font-bold text-foreground">Participants</dt>
              <dd className="text-muted-foreground">{participantCount ?? 0} joined</dd>
            </div>
          </div>
          {program.target_audience && (
            <div className="flex gap-2.5">
              <Target className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" aria-hidden="true" />
              <div>
                <dt className="font-bold text-foreground">Who it&apos;s for</dt>
                <dd className="text-muted-foreground">{program.target_audience}</dd>
              </div>
            </div>
          )}
        </dl>

        {(program.objectives?.length ?? 0) > 0 && (
          <div className="mt-8">
            <h2 className="font-display text-lg font-bold text-forest-950">Objectives</h2>
            <ul className="mt-3 space-y-2">
              {program.objectives.map((o: string) => (
                <li key={o} className="flex items-start gap-2.5 text-sm text-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" aria-hidden="true" />
                  {o}
                </li>
              ))}
            </ul>
          </div>
        )}

        {(program.requirements?.length ?? 0) > 0 && (
          <div className="mt-6">
            <h2 className="font-display text-lg font-bold text-forest-950">Requirements</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
              {program.requirements.map((r: string) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8 border-t border-border pt-6">
          {participation ? (
            <p className="inline-flex items-center gap-2 rounded-lg border border-forest-200 bg-forest-50 px-4 py-3 text-sm font-bold text-forest-800">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              {PARTICIPANT_LABELS[participation.status] ?? participation.status}
            </p>
          ) : (
            <form
              action={async (formData: FormData) => {
                "use server";
                await joinProgram(formData);
              }}
            >
              <input type="hidden" name="program_id" value={program.id} />
              <Button type="submit" className="bg-gold-500 text-forest-950 hover:bg-gold-400 font-bold">
                Join This Program
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
