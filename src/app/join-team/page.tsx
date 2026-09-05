import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { TeamForm } from "@/components/join/team-form";

export const metadata: Metadata = {
  title: "Join as Team",
  description:
    "Professionals, organizers, and returning graduates: join the GBT coordination team with one simple form.",
  alternates: { canonical: "/join-team" },
};

export default function JoinTeamPage() {
  return (
    <>
      <PageHeader
        eyebrow="Join as Team"
        title="Help run the movement"
        description="Students are the heart of GBT — but facilitators, mentors, and organizers make every summer possible. Tell us where you'd like to help."
      />
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <TeamForm />
          <p className="mt-8 flex items-center justify-center gap-2 text-center text-sm text-muted-foreground">
            <GraduationCap className="h-4 w-4 text-forest-700" aria-hidden="true" />
            Still a student?{" "}
            <Link href="/join" className="font-bold text-forest-800 underline-offset-4 hover:underline">
              Apply as a student volunteer
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
