import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  HeartHandshake,
  Home,
  Lightbulb,
  MonitorSmartphone,
  Quote,
  Sparkles,
  Sprout,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/site/section-heading";
import { PhilosophyStrip } from "@/components/site/philosophy-strip";
import { HeroShowcase } from "@/components/site/hero-showcase";
import { HeroImageFader } from "@/components/site/hero-image-fader";
import { Waves } from "@/components/site/waves";
import { Stat } from "@/components/site/stat";
import { ProgramCard } from "@/components/site/program-card";
import { AnnouncementsSection } from "@/components/site/announcements-section";
import { TestimonialsSection } from "@/components/site/testimonials-section";
import { IMPACT_STATS } from "@/lib/data/impact";
import { PROGRAMS } from "@/lib/data/programs";
import { ORG } from "@/lib/site";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSiteContent } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Gamtaa Barattoota Tuulaa (GBT) | From Education to Service",
  description:
    "Gamtaa Barattoota Tuulaa (GBT) unites university students to empower local communities in Tuulaa Town, Eastern Hararghe, Oromia, Ethiopia through free summer education, student mentorship, digital literacy, and volunteer service.",
  keywords: [
    "Gamtaa Barattoota Tuulaa",
    "GBT",
    "Tuulaa",
    "student volunteers",
    "community service",
    "education",
    "student mentorship",
    "Oromia",
    "Ethiopia",
    "free summer school",
    "Eastern Hararghe",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Gamtaa Barattoota Tuulaa (GBT) | From Education to Service",
    description:
      "Gamtaa Barattoota Tuulaa (GBT) unites university students to empower local communities in Tuulaa Town, Eastern Hararghe, Oromia, Ethiopia through free summer education, student mentorship, digital literacy, and volunteer service.",
    url: "/",
  },
};



const WHAT_WE_DO = [
  {
    icon: BookOpen,
    title: "Free Summer Education",
    text: "University students provide free academic support to younger students during school holidays.",
  },
  {
    icon: GraduationCap,
    title: "Student Mentorship",
    text: "University students guide younger students about education, university preparation, careers, and study skills.",
  },
  {
    icon: MonitorSmartphone,
    title: "Digital Literacy",
    text: "We provide computer, internet, and technology education for students and the wider community.",
  },
  {
    icon: HeartHandshake,
    title: "Community Service",
    text: "We organize volunteer and community-development activities chosen together with residents.",
  },
  {
    icon: Users,
    title: "Tolerance & Social Harmony",
    text: "We promote dialogue, respect, peaceful coexistence, and tolerance across our communities.",
  },
  {
    icon: Lightbulb,
    title: "Youth Empowerment",
    text: "We help young people develop skills, confidence, leadership, and aspirations for their future.",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Learn",
    icon: GraduationCap,
    text: "Students receive education and opportunities.",
  },
  {
    step: "02",
    title: "Return",
    icon: Home,
    text: "Students return to their communities.",
  },
  {
    step: "03",
    title: "Serve",
    icon: HeartHandshake,
    text: "Students share their knowledge, skills, and time.",
  },
  {
    step: "04",
    title: "Impact",
    icon: Sparkles,
    text: "Communities benefit from their contribution.",
  },
];

export default async function HomePage() {
  const supabase = await getSupabaseServerClient();

  const { data: announcementsData } = await supabase
    ?.from("announcements")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(6) || { data: [] };

  const { data: testimonialsData } = await supabase
    ?.from("testimonials")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(6) || { data: [] };

  const defaultContent = {
    hero: {
      eyebrow: "A student-led community movement",
      heading: "From Education to Service, From Students to Community Builders.",
      description: ORG.description,
      primaryButtonText: "Join GBT",
      primaryButtonLink: "/join",
      secondaryButtonText: "Explore Our Programs",
      secondaryButtonLink: "/programs",
    },
    whatWeDo: {
      eyebrow: "What We Do",
      title: "Six ways students give back",
      description: "Every GBT initiative turns something a student learned at university into something a child, a school, or a whole community can use.",
    },
    howItWorks: {
      eyebrow: "How GBT Works",
      title: "A simple cycle that changes two lives at once",
      description: "Every volunteer walks the same path: they learned, they returned, they served — and their community felt it.",
    },
    featuredPrograms: {
      eyebrow: "Featured Programs",
      title: "Where our volunteers are serving now",
    },
    philosophy: {
      quote: "“Education is not only an opportunity to improve one's own life; it is also a responsibility to contribute to the community that made that opportunity possible.”",
      author: ORG.philosophy,
    },
    cta: {
      title: "Your community is waiting for what you've learned.",
      description: "Join hundreds of university students who spend their holidays teaching, mentoring, and building. One summer of service can change a child's whole story — and yours.",
      primaryButtonText: "Join GBT",
      primaryButtonLink: "/join",
      secondaryButtonText: "Contact Us",
      secondaryButtonLink: "/contact",
    },
  };

  const content = await getSiteContent("home", defaultContent);

  const featured = PROGRAMS.filter((p) => p.status === "Active").slice(0, 3);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────── */}
      <HeroShowcase 
        imageSrc="/images/hero-bg.jpg" 
        imageAlt="Gamtaa Barattoota Tuulaa university student volunteers"
      >
        <div className="grid w-full items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="max-w-2xl text-white">
            <p className="inline-flex items-center gap-2 rounded-full border border-forest-500/40 bg-forest-900/60 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-forest-200 backdrop-blur">
              <Sprout className="h-3.5 w-3.5 text-gold-400" aria-hidden="true" />
              {content.hero.eyebrow}
            </p>
            <h1 className="mt-6 font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-[3.3rem] whitespace-pre-line text-white">
              {content.hero.heading}
            </h1>
            <p className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-gray-100 whitespace-pre-line drop-shadow-md">
              {content.hero.description}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row flex-wrap gap-3 w-full sm:w-auto">
              <Button asChild size="lg" className="w-full sm:w-auto rounded-full bg-gold-500 text-forest-950 shadow-lg hover:bg-gold-400">
                <Link href={content.hero.primaryButtonLink}>
                  {content.hero.primaryButtonText}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full sm:w-auto rounded-full border-white/40 bg-black/30 text-white backdrop-blur-sm hover:bg-white/30"
              >
                <Link href={content.hero.secondaryButtonLink}>{content.hero.secondaryButtonText}</Link>
              </Button>
            </div>
            <PhilosophyStrip className="mt-10 flex flex-wrap items-center gap-y-3" />
          </div>

          {/* Image fader — below text on mobile, side-by-side on desktop */}
          <div className="flex items-center justify-center w-full mt-4 lg:mt-0">
            <HeroImageFader 
              images={[
                { src: "/images/hero-side-1.jpg", alt: "GBT volunteers organizing and distributing materials" },
                { src: "/images/hero-side-2.jpg", alt: "GBT volunteers posing with certificates" },
                { src: "/images/hero-side-3.jpg", alt: "GBT community service group photo" },
                { src: "/images/hero-side-4.jpg", alt: "GBT volunteers posing together outdoors" },
                { src: "/images/hero-side-5.jpg", alt: "GBT volunteers standing together in a field" }
              ]} 
              intervalMs={4000} 
            />
          </div>

        </div>
      </HeroShowcase>

      {/* ── Impact statistics ────────────────────────── */}
      <section aria-labelledby="stats-heading" className="border-t border-forest-800 bg-forest-900 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="stats-heading" className="sr-only">
            Our impact in numbers
          </h2>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
            {IMPACT_STATS.map((stat) => (
              <Stat
                key={stat.label}
                value={stat.value}
                suffix={stat.suffix}
                label={stat.label}
                description={stat.description}
                variant="dark"
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── What we do ───────────────────────────────── */}
      <section aria-labelledby="what-we-do" className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={content.whatWeDo.eyebrow}
            title={content.whatWeDo.title}
            description={content.whatWeDo.description}
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {WHAT_WE_DO.map((item) => (
              <article
                key={item.title}
                className="group rounded-xl border border-border bg-white p-7 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-forest-100 text-forest-700 transition-colors group-hover:bg-forest-600 group-hover:text-white">
                  <item.icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-display text-lg font-bold text-forest-950">{item.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── How GBT works ────────────────────────────── */}
      <section aria-labelledby="how-it-works" className="bg-cream py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={content.howItWorks.eyebrow}
            title={content.howItWorks.title}
            description={content.howItWorks.description}
          />
          <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((item, i) => (
              <li key={item.step} className="relative">
                <div className="h-full rounded-xl border border-border bg-white p-7 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-4xl font-bold text-gold-500">{item.step}</span>
                    <item.icon className="h-7 w-7 text-forest-600" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold uppercase tracking-wide text-forest-950">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
                </div>
                {i < HOW_IT_WORKS.length - 1 && (
                  <ArrowRight
                    className="absolute -right-4.5 top-1/2 z-10 hidden h-5 w-5 -translate-y-1/2 text-gold-500 lg:block"
                    aria-hidden="true"
                  />
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Featured programs ────────────────────────── */}
      <section aria-labelledby="featured-programs" className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              align="left"
              eyebrow={content.featuredPrograms.eyebrow}
              title={content.featuredPrograms.title}
            />
            <Button asChild variant="outline" className="rounded-full border-forest-300 text-forest-800 hover:bg-forest-50">
              <Link href="/programs">
                View All Programs
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((program) => (
              <ProgramCard key={program.slug} program={program} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Latest Announcements ────────────────────── */}
      <AnnouncementsSection items={announcementsData || []} />

      {/* ── Philosophy quote ─────────────────────────── */}
      <section aria-label="Our philosophy" className="relative overflow-hidden bg-forest-950 py-16 sm:py-20">
        <Waves className="pointer-events-none absolute inset-0 h-full w-full opacity-40" />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
          <Quote className="mx-auto h-8 w-8 text-gold-400" aria-hidden="true" />
          <blockquote className="mt-6 font-display text-xl font-semibold leading-relaxed text-white sm:text-2xl whitespace-pre-line">
            {content.philosophy.quote}
          </blockquote>
          <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-forest-300">
            {content.philosophy.author}
          </p>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────── */}
      <TestimonialsSection testimonials={testimonialsData || []} />

      {/* ── CTA ──────────────────────────────────────── */}
      <section aria-labelledby="join-cta" className="bg-cream py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-forest-950 px-6 py-14 text-center shadow-xl sm:px-14">
            <Waves className="pointer-events-none absolute inset-0 h-full w-full opacity-50" />
            <h2 id="join-cta" className="relative font-display text-3xl font-bold text-white sm:text-4xl whitespace-pre-line">
              {content.cta.title}
            </h2>
            <p className="relative mx-auto mt-4 max-w-2xl text-base leading-relaxed text-forest-100 whitespace-pre-line">
              {content.cta.description}
            </p>
            <div className="relative mt-8 flex flex-col sm:flex-row flex-wrap justify-center gap-3 w-full sm:w-auto">
              <Button asChild size="lg" className="w-full sm:w-auto rounded-full bg-gold-500 text-forest-950 hover:bg-gold-400">
                <Link href={content.cta.primaryButtonLink}>
                  {content.cta.primaryButtonText}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full sm:w-auto rounded-full border-forest-600 bg-transparent text-white hover:bg-forest-900"
              >
                <Link href={content.cta.secondaryButtonLink}>{content.cta.secondaryButtonText}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
