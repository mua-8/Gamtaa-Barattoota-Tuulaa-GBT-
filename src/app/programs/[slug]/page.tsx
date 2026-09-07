import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  MapPin,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgramCard, StatusBadge } from "@/components/site/program-card";
import { PROGRAMS, type Program, type ProgramStatus } from "@/lib/data/programs";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ORG } from "@/lib/site";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
}

function mapProgram(p: any): Program {
  let uiStatus: ProgramStatus = "Active";
  if (p.status === "upcoming") uiStatus = "Upcoming";
  if (p.status === "completed") uiStatus = "Completed";

  let img = p.image_url;
  if (!img || img.includes("default") || !img.includes("real")) {
    if (p.slug?.includes("summer") || p.slug?.includes("education")) img = "/images/programs/summer-school-real.jpg";
    else if (p.slug?.includes("bridge") || p.slug?.includes("mentorship")) img = "/images/programs/mentorship-real.jpg";
    else if (p.slug?.includes("digital") || p.slug?.includes("literacy")) img = "/images/programs/digital-literacy-real.jpg";
    else if (p.slug?.includes("green") || p.slug?.includes("roots") || p.slug?.includes("service")) img = "/images/programs/community-service-real.jpg";
    else if (p.slug?.includes("tolerance") || p.slug?.includes("peace")) img = "/images/programs/tolerance-real.jpg";
    else if (p.slug?.includes("leader") || p.slug?.includes("youth")) img = "/images/programs/mentorship-real.jpg";
    else img = "/images/programs/summer-school-real.jpg";
  }

  return {
    slug: p.slug,
    title: p.title,
    category: p.category || "General",
    status: uiStatus,
    image: img,
    imageAlt: p.title,
    shortDescription: p.short_description || p.description || "",
    description: p.content?.fullDescription ? [p.content.fullDescription] : (p.description ? [p.description] : []),
    objectives: p.objectives || [],
    location: p.location || "Tuulaa Region",
    date: p.start_date ? new Date(p.start_date).toLocaleDateString() : "Ongoing",
    participants: p.target_audience || "Open to community",
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  let program: Program | undefined;

  try {
    const supabase = await getSupabaseServerClient();
    if (supabase) {
      const { data } = await supabase.from("programs").select("*").eq("slug", slug).maybeSingle();
      if (data) {
        program = mapProgram(data);
      }
    }
  } catch {
    // ignore
  }

  if (!program) {
    program = PROGRAMS.find((p) => p.slug === slug);
  }

  if (!program) return { title: "Program not found" };

  return {
    title: program.title,
    description: program.shortDescription,
    alternates: { canonical: `/programs/${program.slug}` },
    openGraph: {
      title: `${program.title} | ${ORG.name}`,
      description: program.shortDescription,
      images: [{ url: program.image, width: 1408, height: 768, alt: program.imageAlt }],
    },
  };
}

export default async function ProgramDetailPage({ params }: PageProps) {
  const { slug } = await params;
  let program: Program | undefined;

  try {
    const supabase = await getSupabaseServerClient();
    if (supabase) {
      const { data } = await supabase.from("programs").select("*").eq("slug", slug).maybeSingle();
      if (data) {
        program = mapProgram(data);
      }
    }
  } catch {
    // ignore
  }

  if (!program) {
    program = PROGRAMS.find((p) => p.slug === slug);
  }

  if (!program) notFound();

  let related: Program[] = [];
  try {
    const supabase = await getSupabaseServerClient();
    if (supabase) {
      const { data: relatedData } = await supabase
        .from("programs")
        .select("*")
        .neq("status", "draft")
        .neq("slug", slug)
        .limit(10);

      if (relatedData && relatedData.length > 0) {
        related = relatedData
          .map(mapProgram)
          .sort((a: Program, b: Program) => {
            const aSame = a.category === program!.category ? 0 : 1;
            const bSame = b.category === program!.category ? 0 : 1;
            return aSame - bSame;
          })
          .slice(0, 3);
      }
    }
  } catch {
    // ignore
  }

  if (related.length === 0) {
    related = PROGRAMS.filter((p) => p.slug !== slug && p.category === program!.category).slice(0, 3);
    if (related.length === 0) {
      related = PROGRAMS.filter((p) => p.slug !== slug).slice(0, 3);
    }
  }

  return (
    <>
      {/* Breadcrumb + header */}
      <section className="bg-forest-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <nav aria-label="Breadcrumb" className="text-xs text-forest-200">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link href="/" className="hover:text-gold-300">Home</Link>
              </li>
              <li aria-hidden="true"><ChevronRight className="h-3 w-3" /></li>
              <li>
                <Link href="/programs" className="hover:text-gold-300">Programs</Link>
              </li>
              <li aria-hidden="true"><ChevronRight className="h-3 w-3" /></li>
              <li aria-current="page" className="font-semibold text-gold-300">{program.title}</li>
            </ol>
          </nav>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Badge className="border-transparent bg-white/95 text-forest-900 hover:bg-white">
              {program.category}
            </Badge>
            <StatusBadge status={program.status} />
          </div>
          <h1 className="mt-4 max-w-3xl font-display text-3xl font-bold tracking-tight sm:text-5xl">
            {program.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-forest-100 sm:text-lg">
            {program.shortDescription}
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_360px] lg:gap-14 lg:px-8">
          {/* Main content */}
          <div>
            <div className="relative overflow-hidden rounded-2xl shadow-md">
              <Image
                src={program.image}
                alt={program.imageAlt}
                width={1408}
                height={768}
                priority
                sizes="(min-width: 1024px) 66vw, 100vw"
                className="h-full w-full object-cover"
              />
            </div>

            <h2 className="mt-10 font-display text-2xl font-bold text-forest-950">
              About this program
            </h2>
            <div className="mt-4 space-y-4 text-base leading-relaxed text-muted-foreground">
              {program.description.map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}
            </div>

            <h2 className="mt-10 font-display text-2xl font-bold text-forest-950">
              What this program achieves
            </h2>
            <ul className="mt-4 space-y-3">
              {program.objectives.map((objective) => (
                <li key={objective} className="flex items-start gap-3 text-base text-foreground">
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-forest-600" aria-hidden="true" />
                  {objective}
                </li>
              ))}
            </ul>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6 lg:pt-1">
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <h2 className="font-display text-lg font-bold text-forest-950">Program details</h2>
              <dl className="mt-4 space-y-4 text-sm">
                <div className="flex gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" aria-hidden="true" />
                  <div>
                    <dt className="font-bold text-foreground">Location</dt>
                    <dd className="mt-0.5 text-muted-foreground">{program.location}</dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" aria-hidden="true" />
                  <div>
                    <dt className="font-bold text-foreground">Schedule</dt>
                    <dd className="mt-0.5 text-muted-foreground">{program.date}</dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Users className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" aria-hidden="true" />
                  <div>
                    <dt className="font-bold text-foreground">Participation</dt>
                    <dd className="mt-0.5 text-muted-foreground">{program.participants}</dd>
                  </div>
                </div>
              </dl>
            </div>

            <div className="rounded-xl bg-forest-950 p-6 text-white shadow-md">
              <h2 className="font-display text-lg font-bold">Get involved</h2>
              <p className="mt-2 text-sm leading-relaxed text-forest-100">
                This program runs on student volunteers. Join GBT to teach, mentor, or organize —
                or contact us to partner with this program.
              </p>
              <div className="mt-5 grid gap-2.5">
                <Button asChild className="bg-gold-500 text-forest-950 hover:bg-gold-400">
                  <Link href="/join">
                    Join GBT
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-forest-500 bg-transparent text-white hover:bg-forest-800"
                >
                  <Link href="/contact">Contact us</Link>
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Related programs */}
      <section aria-labelledby="related-programs" className="bg-cream py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 id="related-programs" className="font-display text-2xl font-bold text-forest-950 sm:text-3xl">
              More programs
            </h2>
            <Button asChild variant="outline" className="border-forest-300 text-forest-900 hover:bg-forest-50">
              <Link href="/programs">View All Programs</Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <ProgramCard key={p.slug} program={p} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
