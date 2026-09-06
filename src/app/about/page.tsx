import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Eye,
  Handshake,
  HeartHandshake,
  Lightbulb,
  Quote,
  ShieldCheck,
  Sprout,
  Target,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/site/page-header";
import { SectionHeading } from "@/components/site/section-heading";
import { TestimonialsSection } from "@/components/site/testimonials-section";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSiteContent } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Who we are, our story, our philosophy, and the vision and mission that drive Gamtaa Barattoota Tuulaa.",
  alternates: { canonical: "/about" },
};

const TIMELINE = [
  {
    title: "GBT Founded",
    text: "A handful of university students from Tuulaa agree on one idea: the education we received is a promise we must repay.",
  },
  {
    title: "Students Join",
    text: "Word spreads across campuses. Hundreds of students from dozens of universities register as volunteers.",
  },
  {
    title: "Preparation",
    text: "Volunteers train together — lesson planning, mentorship skills, safeguarding, and project coordination.",
  },
  {
    title: "Students Return Home",
    text: "At the start of every holiday, volunteers travel back to their communities with plans and materials.",
  },
  {
    title: "Summer Service",
    text: "Classes open, mentorship circles meet, service days run, and dialogue sessions bring neighbors together.",
  },
  {
    title: "Community Impact",
    text: "Students pass exams, young people aim higher, communities grow stronger — and the cycle begins again.",
  },
];

const CORE_VALUES = [
  { icon: BookOpen, title: "Knowledge", text: "We treat learning as a gift meant to be shared." },
  { icon: HeartHandshake, title: "Service", text: "We show up for our communities with our time and skills." },
  { icon: BadgeCheck, title: "Responsibility", text: "We keep the promises we make to students and families." },
  { icon: Handshake, title: "Tolerance", text: "We build respect and friendship across every difference." },
  { icon: ShieldCheck, title: "Integrity", text: "We act openly, report honestly, and lead by example." },
  { icon: Users, title: "Collaboration", text: "We work with schools, elders, and institutions — never alone." },
  { icon: Sprout, title: "Community Development", text: "We choose projects that keep giving after we leave." },
  { icon: Lightbulb, title: "Youth Empowerment", text: "We help every young person see how far they can go." },
];

export default async function AboutPage() {
  const supabase = await getSupabaseServerClient();

  const { data: testimonialsData } = await supabase
    ?.from("testimonials")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(6) || { data: [] };

  const defaultContent = {
    header: {
      eyebrow: "About GBT",
      title: "Students who remember where they came from",
      description: "Gamtaa Barattoota Tuulaa is a community of university students who transform the opportunities they received into meaningful service for the communities that raised them.",
    },
    whoWeAre: {
      eyebrow: "Who We Are",
      title: "A bridge between the university and the village",
      paragraph1: "Gamtaa Barattoota Tuulaa — “the association of Tuulaa students” — was created by university students who noticed a simple gap: every summer, thousands of young people return home with knowledge, energy, and time, while the students behind them need exactly those things.",
      paragraph2: "We exist to connect the two. Our volunteers teach free summer classes, mentor secondary students, run digital literacy labs, organize community service, and lead tolerance and youth empowerment initiatives across Oromia.",
      paragraph3: "We are non-political, non-profit, and open to every university student who shares our belief that education carries a responsibility to give back.",
    },
    ourStory: {
      eyebrow: "Our Story",
      title: "One year in the life of GBT",
      description: "The same journey repeats every year — and every year it reaches more students and more communities.",
    },
    philosophy: {
      quote: "“Education is not only an opportunity to improve one's own life; it is also a responsibility to contribute to the community that made that opportunity possible.”",
      author: "Our Philosophy",
    },
    visionMission: {
      eyebrow: "Vision & Mission",
      title: "Where we are going, and how we get there",
      visionText: "To build a generation of educated, responsible, skilled, and community-minded university students who transform knowledge into meaningful social impact.",
      missionText: "To mobilize university students to contribute their knowledge, skills, and time to the development of their communities through free education, mentorship, community service, tolerance initiatives, and youth empowerment.",
    },
    coreValues: {
      eyebrow: "Core Values",
      title: "The principles behind every program",
    },
  };

  const content = await getSiteContent("about", defaultContent);

  return (
    <>
      <PageHeader
        eyebrow={content.header.eyebrow}
        title={content.header.title}
        description={content.header.description}
      />

      {/* Who we are */}
      <section aria-labelledby="who-we-are" className="py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <div>
            <SectionHeading
              align="left"
              eyebrow={content.whoWeAre.eyebrow}
              title={content.whoWeAre.title}
            />
            <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground whitespace-pre-line">
              <p>{content.whoWeAre.paragraph1}</p>
              <p>{content.whoWeAre.paragraph2}</p>
              <p>{content.whoWeAre.paragraph3}</p>
            </div>
          </div>
          <div className="relative">
            <div className="overflow-hidden rounded-2xl shadow-lg">
              <Image
                src="/images/about-team-real.jpg"
                alt="GBT student volunteers proudly holding certificates at a community recognition ceremony"
                width={1408}
                height={768}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="h-full w-full object-cover"
              />
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              GBT volunteers receiving certificates of recognition.
            </p>
          </div>
        </div>
      </section>

      {/* Our story timeline */}
      <section aria-labelledby="our-story" className="bg-forest-50/60 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={content.ourStory.eyebrow}
            title={content.ourStory.title}
            description={content.ourStory.description}
          />
          <ol className="relative mx-auto mt-14 max-w-3xl space-y-10 border-l-2 border-forest-200 pl-8 sm:pl-10">
            {TIMELINE.map((item, i) => (
              <li key={item.title} className="relative">
                <span
                  aria-hidden="true"
                  className="absolute -left-[41px] top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-gold-500 bg-white sm:-left-[49px]"
                >
                  <span className="h-2 w-2 rounded-full bg-gold-500" />
                </span>
                <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-gold-600">
                    Step {i + 1}
                  </p>
                  <h3 className="mt-1.5 font-display text-lg font-bold text-forest-950">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Philosophy */}
      <section aria-label="Our philosophy" className="bg-forest-900 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <Quote className="mx-auto h-8 w-8 text-gold-400" aria-hidden="true" />
          <blockquote className="mt-6 font-display text-xl font-semibold leading-relaxed text-white sm:text-2xl whitespace-pre-line">
            {content.philosophy.quote}
          </blockquote>
          <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-gold-300">
            {content.philosophy.author}
          </p>
        </div>
      </section>

      {/* Vision & mission */}
      <section aria-labelledby="vision-mission" className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={content.visionMission.eyebrow}
            title={content.visionMission.title}
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <article className="rounded-2xl border-t-4 border-forest-700 bg-white p-8 shadow-md sm:p-10">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-forest-100 text-forest-800">
                <Eye className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-display text-2xl font-bold text-forest-950">Our Vision</h3>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground whitespace-pre-line">
                {content.visionMission.visionText}
              </p>
            </article>
            <article className="rounded-2xl border-t-4 border-gold-500 bg-white p-8 shadow-md sm:p-10">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gold-100 text-gold-700">
                <Target className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-display text-2xl font-bold text-forest-950">Our Mission</h3>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground whitespace-pre-line">
                {content.visionMission.missionText}
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Core values */}
      <section aria-labelledby="core-values" className="bg-cream py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={content.coreValues.eyebrow}
            title={content.coreValues.title}
          />
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {CORE_VALUES.map((value) => (
              <li
                key={value.title}
                className="rounded-xl border border-border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-forest-100 text-forest-800">
                  <value.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-display text-base font-bold text-forest-950">{value.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{value.text}</p>
              </li>
            ))}
          </ul>
          <div className="mt-14 text-center">
            <Button asChild size="lg" className="bg-gold-500 text-forest-950 hover:bg-gold-400">
              <Link href="/join">
                Become part of the story
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsSection testimonials={testimonialsData || []} />
    </>
  );
}
