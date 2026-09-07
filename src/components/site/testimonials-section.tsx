import { Quote, Star } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";

export interface TestimonialItem {
  id: string;
  name: string;
  role?: string | null;
  organization?: string | null;
  photo_url?: string | null;
  quote: string;
  is_published?: boolean;
}

const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  {
    id: "def-1",
    name: "Ahmed Mohammed",
    role: "Engineering Student & Volunteer",
    organization: "Haramaya University",
    quote:
      "Teaching math to high school students in Tuulaa during my summer holiday made me realize how much of a difference university students can make. Seeing them pass their national exams was the proudest moment of my academic journey.",
    photo_url: "/images/hero-side-2.jpg",
  },
  {
    id: "def-2",
    name: "Fatima Abdurrahman",
    role: "Community Elder & Parent",
    organization: "Tuulaa Community",
    quote:
      "GBT's summer tutoring program gave our children the confidence they needed. Having mentors who grew up in this exact community inspired them to work harder and believe that university is possible for them too.",
    photo_url: "",
  },
  {
    id: "def-3",
    name: "Obsa Bekele",
    role: "Digital Literacy Mentor",
    organization: "GBT Volunteer",
    quote:
      "Many of our students had never operated a computer before our workshop. In just four weeks, they were typing, researching online, and creating documents. The hunger to learn here is truly unmatched.",
    photo_url: "/images/hero-side-4.jpg",
  },
];

export function TestimonialsSection({ testimonials }: { testimonials?: TestimonialItem[] }) {
  // If the admin has uploaded and published testimonials in the CMS, prioritize all database items
  const publishedFromDb = testimonials && testimonials.length > 0 ? testimonials : [];
  
  // If database has items, display all published items (up to 6); if fewer than 3, backfill with defaults
  let items: TestimonialItem[] = [];
  if (publishedFromDb.length >= 3) {
    items = publishedFromDb.slice(0, 6);
  } else if (publishedFromDb.length > 0) {
    items = [...publishedFromDb];
    for (const def of DEFAULT_TESTIMONIALS) {
      if (items.length >= 3) break;
      if (!items.some((t) => t.name.toLowerCase() === def.name.toLowerCase())) {
        items.push(def);
      }
    }
  } else {
    items = DEFAULT_TESTIMONIALS;
  }

  return (
    <section aria-labelledby="testimonials-heading" className="relative bg-cream py-20 sm:py-24 border-t border-forest-100/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Voices of Our Community"
          title="What People Say About GBT"
          description="Hear firsthand from university student volunteers, parents, and community partners about the tangible impact of our programs."
        />

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col justify-between rounded-2xl border border-forest-100/90 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <div>
                {/* Gold Quote icon & Stars */}
                <div className="flex items-center justify-between mb-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-50 text-gold-600 border border-gold-200/60">
                    <Quote className="h-5 w-5" />
                  </span>
                  <div className="flex items-center gap-1 text-gold-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </div>

                {/* Quote Text */}
                <blockquote className="text-forest-900 leading-relaxed text-sm sm:text-base italic font-serif">
                  &ldquo;{item.quote}&rdquo;
                </blockquote>
              </div>

              {/* Author Info */}
              <div className="mt-8 flex items-center gap-4 border-t border-gray-100 pt-6">
                {item.photo_url ? (
                  <img
                    src={item.photo_url}
                    alt={item.name}
                    className="h-12 w-12 rounded-full object-cover border-2 border-gold-400/40 shadow-xs"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-forest-900 text-sm font-bold text-gold-300 border-2 border-gold-400/40 shadow-xs">
                    {item.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-display font-bold text-forest-950 text-base truncate">
                    {item.name}
                  </p>
                  {(item.role || item.organization) && (
                    <p className="text-xs text-muted-foreground truncate">
                      {[item.role, item.organization].filter(Boolean).join(" • ")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
