import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/site/page-header";
import { SectionHeading } from "@/components/site/section-heading";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { parseTeamMember } from "@/lib/team-util";
import { FounderSection } from "@/components/site/founder-section";

export const metadata: Metadata = {
  title: "Our Team",
  description:
    "Meet the founder and students who help plan, coordinate, and deliver GBT's educational and community service programs.",
  alternates: { canonical: "/team" },
};

function TeamMemberCard({ member }: { member: any }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-square w-full overflow-hidden bg-forest-100 flex items-center justify-center">
        {member.photo_url ? (
          <Image
            src={member.photo_url}
            alt={`Portrait of ${member.name}, ${member.position}`}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover object-top"
          />
        ) : (
          <div className="text-4xl font-bold text-forest-300">{member.name.charAt(0)}</div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6 items-center text-center">
        <h3 className="font-display text-lg font-bold text-forest-950">{member.name}</h3>
        <Badge className="mt-2 w-fit border-transparent bg-gold-100 text-gold-800 hover:bg-gold-100">
          {member.position}
        </Badge>
        
        {(member.university || member.department) && (
          <p className="mt-3 flex items-center justify-center gap-2 text-xs font-semibold text-muted-foreground">
            <GraduationCap className="h-4 w-4 text-forest-600" aria-hidden="true" />
            {member.university && <span>{member.university}</span>}
            {member.university && member.department && <span>·</span>}
            {member.department && <span>{member.department}</span>}
          </p>
        )}
      </div>
    </article>
  );
}

export default async function TeamPage() {
  const supabase = await getSupabaseServerClient();
  const { data: rawMembers } = (await supabase
    ?.from("team_members")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true })) || { data: [] };

  const parsed = (rawMembers || []).map(parseTeamMember);
  const founder = parsed.find((m: any) => m.member_type === "founder") || null;
  const activeMembers = parsed.filter((m: any) => m.member_type !== "founder");

  return (
    <>
      <PageHeader
        eyebrow="Our Team"
        title="Student leaders, community servants"
        description="Meet the founder and university students who lead and coordinate GBT's educational and community initiatives."
      />

      {/* 1. Founder Section (Placed directly ABOVE "Our Active Team Members") */}
      {founder && <FounderSection founder={founder} />}

      {/* 2. Our Active Team Members Section */}
      <section
        aria-labelledby="team-programs"
        className="py-16 sm:py-20 bg-forest-50/30"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Leadership"
            title="Our Active Team Members"
            align="center"
          />
          
          {activeMembers && activeMembers.length > 0 ? (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {activeMembers.map((member: any) => (
                <TeamMemberCard key={member.id} member={member} />
              ))}
            </div>
          ) : (
            <div className="mt-12 text-center text-muted-foreground py-12">
              <p>Team members are currently being updated.</p>
            </div>
          )}
        </div>
      </section>

      {/* 3. Closing Call To Action */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold text-forest-950 sm:text-3xl">
            Every one of them started as a volunteer.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
            Leadership roles at GBT are earned in the field — teaching, serving, and showing up.
            Your journey can start this holiday.
          </p>
          <Button asChild size="lg" className="mt-7 bg-gold-500 text-forest-950 hover:bg-gold-400 font-bold">
            <Link href="/join">
              Join GBT
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
