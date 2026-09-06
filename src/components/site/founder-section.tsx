import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Quote } from "lucide-react";
import type { FounderData } from "@/lib/team-util";

interface FounderSectionProps {
  founder: FounderData | null;
}

export function FounderSection({ founder }: FounderSectionProps) {
  if (!founder || !founder.is_active) return null;

  return (
    <section
      aria-labelledby="founder-section-heading"
      className="relative overflow-hidden bg-gradient-to-b from-white via-forest-50/40 to-white py-16 sm:py-20 border-b border-forest-100/80"
    >
      {/* Decorative subtle background watermark */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-gold-500/5 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -bottom-24 h-96 w-96 rounded-full bg-forest-900/5 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-2xl sm:rounded-3xl border border-forest-100 bg-white/90 p-6 sm:p-10 lg:p-12 shadow-xl shadow-forest-950/5 backdrop-blur-xs">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
            
            {/* Left Column: Founder Portrait (Mobile: Centered on top) */}
            <div className="flex flex-col items-center lg:col-span-5">
              <div className="relative w-full max-w-[280px] sm:max-w-[320px] lg:max-w-none aspect-[4/5] overflow-hidden rounded-2xl border-4 border-white bg-forest-100 shadow-xl ring-1 ring-gold-400/30">
                {founder.photo_url ? (
                  <Image
                    src={founder.photo_url}
                    alt={`Portrait of ${founder.name}, ${founder.position || "Founder"}`}
                    fill
                    sizes="(min-width: 1024px) 380px, (min-width: 640px) 320px, 280px"
                    className="object-cover object-top"
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-forest-900 text-6xl font-bold text-gold-400">
                    {founder.name.charAt(0)}
                  </div>
                )}

                {/* Subtle gold badge on image */}
                <div className="absolute bottom-3 left-3 right-3 rounded-xl bg-forest-950/85 px-4 py-2 text-center text-xs font-bold uppercase tracking-[0.18em] text-gold-400 backdrop-blur-md border border-gold-500/30 shadow-lg">
                  {founder.position || "Founder"}
                </div>
              </div>

              {/* Education Credentials if available */}
              {(founder.university || founder.department) && (
                <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 text-center text-xs font-semibold text-forest-800">
                  <GraduationCap className="h-4 w-4 text-gold-600 shrink-0" aria-hidden="true" />
                  {founder.university && <span>{founder.university}</span>}
                  {founder.university && founder.department && <span>·</span>}
                  {founder.department && <span className="text-muted-foreground">{founder.department}</span>}
                </div>
              )}
            </div>

            {/* Right Column: Founder Information */}
            <div className="flex flex-col justify-center text-center lg:col-span-7 lg:text-left">
              {/* Eyebrow & Badge */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
                <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-gold-600">
                  Vision & Leadership
                </span>
                <span className="text-forest-300">•</span>
                <Badge className="border-transparent bg-forest-900 text-gold-400 font-bold hover:bg-forest-900 text-xs px-2.5 py-0.5">
                  {founder.position || "Founder"}
                </Badge>
              </div>

              {/* Founder Name */}
              <h2
                id="founder-section-heading"
                className="mt-3 font-display text-3xl font-extrabold tracking-tight text-forest-950 sm:text-4xl lg:text-5xl"
              >
                {founder.name}
              </h2>

              {/* Short Introduction / Philosophy Statement */}
              {founder.intro && (
                <div className="relative mt-5 rounded-xl border-l-4 border-gold-500 bg-gold-50/50 py-3.5 pl-4 pr-3 text-left">
                  <Quote className="absolute right-3 top-3 h-5 w-5 text-gold-400/40 rotate-180" aria-hidden="true" />
                  <p className="text-base sm:text-lg font-medium italic leading-relaxed text-forest-900">
                    "{founder.intro}"
                  </p>
                </div>
              )}

              {/* Full Biography / Narrative */}
              {founder.bio && (
                <div className="mt-5 space-y-3.5 text-left text-base sm:text-[17px] leading-relaxed text-forest-800/90">
                  {founder.bio.split("\n\n").map((paragraph, index) => (
                    <p key={index} className="leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
