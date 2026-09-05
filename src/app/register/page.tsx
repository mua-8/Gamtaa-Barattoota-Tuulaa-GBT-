import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardCheck, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/site/page-header";
import { SimpleApplicationForm } from "@/components/join/simple-application-form";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Volunteer Registration",
  description: "Apply to Gamtaa Barattoota Tuulaa in one simple form.",
  alternates: { canonical: "/register" },
  robots: { index: false, follow: true },
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending Review",
  under_review: "Under Review",
  approved: "Approved",
  rejected: "Rejected",
  suspended: "Suspended",
};

export default async function RegisterPage() {
  let signedInAs: string | null = null;
  let initial = { fullName: "", phone: "", homeCommunity: "" };
  let existingApplication: {
    application_number: string;
    status: string;
    submitted_at: string;
  } | null = null;

  if (isSupabaseConfigured) {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

    if (supabase && user) {
      signedInAs = user.email ?? null;
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", user.id)
        .single();
      const { data: studentProfile } = await supabase
        .from("student_profiles")
        .select("id, home_community")
        .eq("profile_id", user.id)
        .single();
      const { data: application } = studentProfile
        ? await supabase
            .from("applications")
            .select("application_number, status, submitted_at")
            .eq("student_profile_id", studentProfile.id)
            .limit(1)
            .single()
        : { data: null };
      initial = {
        fullName: profile?.full_name ?? "",
        phone: profile?.phone ?? "",
        homeCommunity: studentProfile?.home_community ?? "",
      };
      existingApplication = application;
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Volunteer Registration"
        title="Student Registration"
        description="One simple form: create your account and apply in the same step. Your information stays private and is only used to match you with programs."
      />

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
          {!isSupabaseConfigured ? (
            <p role="status" className="rounded-lg border border-gold-300 bg-gold-50 px-4 py-3 text-sm font-semibold text-gold-800">
              Preview note: Supabase is not connected, so registration opens once the backend is
              configured.
            </p>
          ) : existingApplication ? (
            <div className="mx-auto max-w-lg rounded-2xl border border-forest-200 bg-white p-10 text-center shadow-md">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-forest-100 text-forest-700">
                <ClipboardCheck className="h-7 w-7" aria-hidden="true" />
              </span>
              <h2 className="mt-5 font-display text-2xl font-bold text-forest-950">
                You&apos;ve already applied
              </h2>
              <dl className="mx-auto mt-6 max-w-xs space-y-2 rounded-xl bg-cream p-5 text-left text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="font-semibold text-foreground">Number</dt>
                  <dd className="font-mono font-bold text-forest-900">
                    {existingApplication.application_number}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="font-semibold text-foreground">Status</dt>
                  <dd>
                    <Badge className="border-transparent bg-gold-100 text-gold-800 hover:bg-gold-100">
                      {STATUS_LABELS[existingApplication.status] ?? existingApplication.status}
                    </Badge>
                  </dd>
                </div>
              </dl>
              <Link href="/student/dashboard" className="mt-6 inline-block text-sm font-bold text-forest-800 underline-offset-4 hover:underline">
                Go to your Volunteer Dashboard →
              </Link>
            </div>
          ) : (
            <SimpleApplicationForm signedInAs={signedInAs} initial={initial} />
          )}

          <p className="mt-10 flex items-center justify-center gap-2 text-center text-sm text-muted-foreground">
            <Users className="h-4 w-4 text-forest-700" aria-hidden="true" />
            Already a professional or organizer?{" "}
            <Link href="/join-team" className="font-bold text-forest-800 underline-offset-4 hover:underline">
              Join as a team member
            </Link>
          </p>
          </div>
        </div>
      </section>
    </>
  );
}
