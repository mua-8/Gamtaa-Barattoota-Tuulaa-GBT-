"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { CalendarDays, Expand, MapPin } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { Lightbox } from "@/components/site/lightbox";
import { cn } from "@/lib/utils";

const ALL = "All Photos";

export function GalleryBrowser({ initialItems, categories }: { initialItems: any[], categories: string[] }) {
  const [category, setCategory] = useState<string>(ALL);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const items = useMemo(
    () =>
      category === ALL
        ? initialItems
        : initialItems.filter((item) => item.category === category),
    [category, initialItems]
  );

  return (
    <>
      <PageHeader
        eyebrow="Gallery"
        title="Moments from the field"
        description="Classrooms under trees, service days, dialogue circles, and celebrations — a look at what student service actually looks like."
      />

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Category filter */}
          <div role="group" aria-label="Filter gallery by category" className="flex flex-wrap gap-2">
            {[ALL, ...categories].map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={category === c}
                onClick={() => {
                  setCategory(c);
                  setLightboxIndex(null);
                }}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-xs font-bold transition-colors",
                  category === c
                    ? "border-forest-800 bg-forest-800 text-white"
                    : "border-border bg-white text-muted-foreground hover:border-forest-300 hover:text-forest-800"
                )}
              >
                {c}
              </button>
            ))}
          </div>

          <p className="mt-5 text-sm font-semibold text-muted-foreground" role="status">
            {items.length} {items.length === 1 ? "photo" : "photos"}
          </p>

          {/* Grid */}
          <ul className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setLightboxIndex(i)}
                  aria-label={`Open image: ${item.caption}`}
                  className="group relative block w-full overflow-hidden rounded-xl border border-border bg-white text-left shadow-sm transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <Image
                      src={item.src}
                      alt={item.alt}
                      fill
                      unoptimized
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-forest-950/80 via-forest-950/10 to-transparent opacity-80 transition-opacity group-hover:opacity-95" />
                    <span className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
                      <Expand className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="absolute inset-x-0 bottom-0 p-4">
                      <span className="block text-xs font-bold uppercase tracking-wider text-gold-300">
                        {item.category}
                      </span>
                      <span className="mt-1 block text-sm font-semibold leading-snug text-white">
                        {item.caption}
                      </span>
                      <span className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] text-forest-100">
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="h-3 w-3 text-gold-400" aria-hidden="true" />
                          {item.date}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-gold-400" aria-hidden="true" />
                          {item.location}
                        </span>
                      </span>
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {lightboxIndex !== null && items[lightboxIndex] && (
        <Lightbox
          items={items}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={setLightboxIndex}
        />
      )}
    </>
  );
}
