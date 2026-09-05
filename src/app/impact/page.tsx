import type { Metadata } from "next";
import Image from "next/image";
import { MapPin, Quote } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/site/page-header";
import { SectionHeading } from "@/components/site/section-heading";
import { Stat } from "@/components/site/stat";
import { AreaChart, BarChart, DonutChart } from "@/components/site/charts";
import {
  HOURS_BY_AREA,
  IMPACT_DETAIL_STATS,
  IMPACT_STORIES,
  STUDENTS_PER_YEAR,
  VOLUNTEERS_PER_YEAR,
} from "@/lib/data/impact";

export const metadata: Metadata = {
  title: "Our Impact",
  description:
    "Measurable change: volunteers mobilized, communities served, schools reached, students taught, programs completed, and hours given since 2021.",
  alternates: { canonical: "/impact" },
};

export default function ImpactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our Impact"
        title="What happens when students give back"
        description="Since 2021, GBT volunteers have turned holiday weeks into classrooms, mentorship circles, service days, and dialogues. These numbers are the footprint of that choice."
      />

      {/* Headline stats */}
      <section aria-labelledby="impact-stats" className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="impact-stats" className="sr-only">Impact statistics</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {IMPACT_DETAIL_STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-border bg-white p-8 shadow-sm"
              >
                <Stat
                  value={stat.value}
                  suffix={stat.suffix}
                  label={stat.label}
                  description={stat.description}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Charts */}
      <section aria-labelledby="impact-charts" className="bg-forest-50/60 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="The Trend"
            title="Growing every single year"
            description="Demonstration data for Phase 1 — live figures will flow from our Supabase records in a later phase."
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-lg font-bold text-forest-950">
                  Students reached per year
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart data={STUDENTS_PER_YEAR} label="Students reached per year" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-lg font-bold text-forest-950">
                  Active volunteers per year
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AreaChart data={VOLUNTEERS_PER_YEAR} label="Active volunteers per year" />
              </CardContent>
            </Card>
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="font-display text-lg font-bold text-forest-950">
                  Volunteer hours by program area
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DonutChart data={HOURS_BY_AREA} label="Volunteer hours by program area" />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Impact stories */}
      <section aria-labelledby="impact-stories" className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Impact Stories"
            title="Behind every number is a name"
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {IMPACT_STORIES.map((story) => (
              <article
                key={story.id}
                className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative h-48 w-full">
                  <Image
                    src={story.image}
                    alt={story.imageAlt}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex flex-wrap gap-2">
                    <Badge className="border-transparent bg-forest-100 text-forest-800 hover:bg-forest-100">
                      {story.program}
                    </Badge>
                    <Badge variant="outline" className="gap-1 text-muted-foreground">
                      <MapPin className="h-3 w-3" aria-hidden="true" />
                      {story.community}
                    </Badge>
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold text-forest-950">
                    {story.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                    {story.description}
                  </p>
                  <Quote className="mt-auto h-5 w-5 pt-4 text-gold-400" aria-hidden="true" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
