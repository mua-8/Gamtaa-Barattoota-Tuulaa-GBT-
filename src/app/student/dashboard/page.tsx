import type { Metadata } from "next";
import Link from "next/link";
import {
  Award,
  CalendarDays,
  ClipboardList,
  Clock,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarChart } from "@/components/site/charts";
import { DashboardNotifications } from "@/components/student/dashboard-notifications";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Volunteer Dashboard",
  description: "Your GBT dashboard: application status, volunteer activities, service hours, and certificates.",
  robots: { index: false },
};

const APPLICATION_LABELS: Record<string, string> = {
  pending: "Pending Review",
  under_review: "Under Review",
  approved: "Approved",
  rejected: "Rejected",
  suspended: "Suspended",
};

interface Participation {
  status: string;
  programs: {
    title: string;
    location: string | null;
    start_date: string | null;
    end_date: string | null;
  } | null;
}

function ProgramList({ title, items }: { title: string; items: Participation[] }) {
  return (
    <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
      <h2 className="font-display text-lg font-bold text-forest-950">{title}</h2>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Nothing here yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((p, i) => (
            <li key={i} className="rounded-lg bg-cream p-4">
              <p className="text-sm font-bold text-foreground">{p.programs?.title ?? "Program"}</p>
              <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {p.programs?.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-forest-600" aria-hidden="true" />
                    {p.programs.location}
                  </span>
                )}
                {p.programs?.start_date && (
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="h-3 w-3 text-forest-600" aria-hidden="true" />
                    {p.programs.start_date} → {p.programs?.end_date ?? "…"}
                  </span>
                )}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();
  const { data: studentProfile } = await supabase
    .from("student_profiles")
    .select("id")
    .eq("profile_id", user.id)
    .single();
  const { data: application } = studentProfile
    ? await supabase
        .from("applications")
        .select("status, application_number")
        .eq("student_profile_id", studentProfile.id)
        .order("submitted_at", { ascending: false })
        .limit(1)
        .single()
    : { data: null };
  const { data: participations } = await supabase
    .from("program_participants")
    .select("status, programs(title, location, start_date, end_date)")
    .eq("student_id", user.id)
    .neq("status", "withdrawn");
  const { data: hours } = await supabase.rpc("my_verified_hours");
  const { count: certificateCount } = await supabase
    .from("certificates")
    .select("id", { count: "exact", head: true })
    .eq("student_id", user.id);
  const { data: verifiedRecords } = await supabase
    .from("service_records")
    .select("date, hours")
    .eq("student_id", user.id)
    .eq("verification_status", "verified")
    .order("date");
  const { data: recentNotifications } = await supabase
    .from("notifications")
    .select("id, title, message, type, created_at, read")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(4);

  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const byMonth = new Map<string, number>();
  for (const r of verifiedRecords ?? []) {
    const [y, m] = String(r.date).split("-");
    const key = `${MONTHS[Number(m) - 1]} ${y.slice(2)}`;
    byMonth.set(key, (byMonth.get(key) ?? 0) + Number(r.hours));
  }
  const hoursByMonth = Array.from(byMonth.entries()).map(([year, value]) => ({ year, value }));

  const parts = (participations ?? []) as unknown as Participation[];
  const active = parts.filter((p) => p.status === "active");
  const upcoming = parts.filter((p) => p.status === "registered" || p.status === "accepted");
  const completed = parts.filter((p) => p.status === "completed");

  const stats = [
    {
      icon: ClipboardList,
      label: "Application",
      value: application ? APPLICATION_LABELS[application.status] ?? application.status : "Not submitted",
      href: "/join",
    },
    { icon: CalendarDays, label: "Volunteer Activities", value: String(parts.length), href: "/student/my-programs" },
    {
      icon: Clock,
      label: "Verified Service Hours",
      value: String(Number(hours ?? 0)),
      href: "/student/service-history",
    },
    { icon: Award, label: "Certificates", value: String(certificateCount ?? 0), href: "/student/certificates" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-600 whitespace-nowrap">GBT Volunteer Portal</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-forest-950">
          Welcome back, {profile?.full_name || "Volunteer"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Explore available GBT volunteer activities and manage your participation.
        </p>
      </div>

      <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-xl border border-border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <s.icon className="h-4 w-4 text-forest-700" aria-hidden="true" />
              {s.label}
            </dt>
            <dd className="mt-3 font-display text-2xl font-bold text-forest-950">{s.value}</dd>
          </Link>
        ))}
      </dl>

      {application?.status === "approved" && (
        <p className="rounded-lg border border-forest-200 bg-forest-50 px-4 py-3 text-sm font-semibold text-forest-800">
          Your application {application.application_number} is approved — browse programs and
          start serving!
        </p>
      )}
      {!application && (
        <div className="rounded-lg border border-gold-300 bg-gold-50 px-4 py-3 text-sm font-semibold text-gold-800">
          You haven&apos;t submitted an application yet.{" "}
          <Link href="/join" className="underline underline-offset-4">Apply now</Link>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold text-forest-950">Verified hours by month</h2>
          {hoursByMonth.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No verified hours yet — submit service records and they&apos;ll chart here once verified.
            </p>
          ) : (
            <div className="mt-4">
              <BarChart data={hoursByMonth} label="Verified service hours by month" color="var(--chart-2)" />
            </div>
          )}
        </div>
        <DashboardNotifications initialItems={recentNotifications ?? []} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <ProgramList title="Active programs" items={active} />
        <ProgramList title="Upcoming programs" items={upcoming} />
        <ProgramList title="Completed programs" items={completed} />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild className="bg-forest-800 text-white hover:bg-forest-700">
          <Link href="/student/programs">Browse Volunteer Activities</Link>
        </Button>
        <Button asChild variant="outline" className="border-forest-300 text-forest-900 hover:bg-forest-50">
          <Link href="/student/service-history">Log Service Hours</Link>
        </Button>
      </div>
    </div>
  );
}
