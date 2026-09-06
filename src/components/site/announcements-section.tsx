"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, Megaphone, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/site/section-heading";
import { extractAnnouncementImage } from "@/lib/announcements-util";

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  image_url?: string | null;
  is_published: boolean;
  created_at: string;
}

export function AnnouncementsSection({ items }: { items: AnnouncementItem[] }) {
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementItem | null>(null);

  if (!items || items.length === 0) return null;

  return (
    <section aria-labelledby="announcements-heading" className="bg-cream/60 py-20 sm:py-24 border-t border-forest-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            align="left"
            eyebrow="News & Updates"
            title="Latest Announcements"
            description="Stay up-to-date with our latest community initiatives, volunteer calls, and student association news."
          />
          <Button asChild variant="outline" className="rounded-full border-forest-300 text-forest-800 hover:bg-forest-50">
            <Link href="/announcements">
              All Announcements
              <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, 3).map((item) => {
            const { imageUrl, cleanContent } = extractAnnouncementImage(item.content);
            const activeImage = item.image_url || imageUrl;
            const dateStr = new Date(item.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            return (
              <article
                key={item.id}
                onClick={() => setSelectedAnnouncement(item)}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-forest-100/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer"
              >
                <div>
                  {/* Image header or Decorative banner */}
                  {activeImage ? (
                    <div className="relative h-52 w-full overflow-hidden bg-forest-950">
                      <img
                        src={activeImage}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-forest-900/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-gold-300 shadow-sm border border-gold-500/20">
                          <Megaphone className="h-3 w-3" /> Announcement
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white/90">
                        <span className="inline-flex items-center gap-1 font-medium drop-shadow">
                          <Calendar className="h-3.5 w-3.5 text-gold-400" /> {dateStr}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="relative flex h-36 w-full items-center justify-between overflow-hidden bg-gradient-to-br from-forest-900 via-forest-800 to-forest-950 p-6 text-white">
                      <div className="relative z-10">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-forest-950/80 px-3 py-1 text-xs font-semibold text-gold-300 border border-gold-500/20">
                          <Megaphone className="h-3 w-3" /> Announcement
                        </span>
                        <div className="mt-3 flex items-center gap-1.5 text-xs text-forest-200">
                          <Calendar className="h-3.5 w-3.5 text-gold-400" /> {dateStr}
                        </div>
                      </div>
                      <Megaphone className="h-20 w-20 text-forest-700/40 -mr-4 -mt-2 rotate-12" />
                    </div>
                  )}

                  {/* Body */}
                  <div className="p-6">
                    <h3 className="font-display text-xl font-bold tracking-tight text-forest-950 group-hover:text-forest-700 transition-colors">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-3 whitespace-pre-line">
                      {cleanContent}
                    </p>
                  </div>
                </div>

                {/* Footer link */}
                <div className="px-6 pb-6 pt-2">
                  <span className="inline-flex items-center text-sm font-bold text-forest-800 group-hover:text-gold-600 transition-colors">
                    Read Full Story <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Reader Modal */}
      {selectedAnnouncement && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setSelectedAnnouncement(null)}
        >
          <div 
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedAnnouncement(null)}
              className="absolute top-4 right-4 z-10 rounded-full bg-black/60 p-2 text-white hover:bg-black transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Image */}
            {(() => {
              const { imageUrl, cleanContent } = extractAnnouncementImage(selectedAnnouncement.content);
              const activeImg = selectedAnnouncement.image_url || imageUrl;
              const formattedDate = new Date(selectedAnnouncement.created_at).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              });

              return (
                <>
                  {activeImg && (
                    <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-forest-950">
                      <img
                        src={activeImg}
                        alt={selectedAnnouncement.title}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    </div>
                  )}

                  <div className="p-6 sm:p-8">
                    <div className="flex items-center gap-2 text-xs font-semibold text-forest-700 uppercase tracking-wider mb-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-forest-100 px-3 py-1 text-forest-900">
                        <Megaphone className="h-3 w-3 text-forest-700" /> Official Announcement
                      </span>
                      <span>•</span>
                      <span className="text-muted-foreground">{formattedDate}</span>
                    </div>

                    <h2 className="font-display text-2xl sm:text-3xl font-bold text-forest-950 mt-3 leading-tight">
                      {selectedAnnouncement.title}
                    </h2>

                    <div className="mt-6 border-t border-gray-100 pt-6 text-forest-900 leading-relaxed text-base whitespace-pre-line space-y-4">
                      {cleanContent}
                    </div>

                    <div className="mt-8 flex justify-end border-t border-gray-100 pt-4">
                      <Button
                        onClick={() => setSelectedAnnouncement(null)}
                        className="rounded-full bg-forest-900 text-white hover:bg-forest-800"
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </section>
  );
}
