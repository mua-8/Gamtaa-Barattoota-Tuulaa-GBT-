"use client";

import { useState } from "react";
import { Search, Calendar, Megaphone, ArrowRight, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { extractAnnouncementImage } from "@/lib/announcements-util";
import type { AnnouncementItem } from "@/components/site/announcements-section";

export function AnnouncementsFeed({ items }: { items: AnnouncementItem[] }) {
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<AnnouncementItem | null>(null);

  const filtered = items.filter((item) => {
    const s = search.toLowerCase();
    return (
      item.title.toLowerCase().includes(s) ||
      item.content.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-8">
      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search announcements..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 rounded-full border-gray-300 bg-white shadow-xs focus-visible:ring-forest-600"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
          >
            Clear
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <Megaphone className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 font-display text-lg font-bold text-forest-950">No announcements found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {search ? "Try searching with different keywords." : "Check back soon for new updates from GBT."}
          </p>
          {search && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearch("")}
              className="mt-4 rounded-full"
            >
              Reset search
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => {
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
                onClick={() => setSelectedItem(item)}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-forest-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer"
              >
                <div>
                  {activeImage ? (
                    <div className="relative h-52 w-full overflow-hidden bg-forest-950">
                      <img
                        src={activeImage}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
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

                  <div className="p-6">
                    <h3 className="font-display text-xl font-bold tracking-tight text-forest-950 group-hover:text-forest-700 transition-colors">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-3 whitespace-pre-line">
                      {cleanContent}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2">
                  <span className="inline-flex items-center text-sm font-bold text-forest-800 group-hover:text-gold-600 transition-colors">
                    Read Full Story <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Reader Modal */}
      {selectedItem && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setSelectedItem(null)}
        >
          <div 
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-10 rounded-full bg-black/60 p-2 text-white hover:bg-black transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            {(() => {
              const { imageUrl, cleanContent } = extractAnnouncementImage(selectedItem.content);
              const activeImg = selectedItem.image_url || imageUrl;
              const formattedDate = new Date(selectedItem.created_at).toLocaleDateString("en-US", {
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
                        alt={selectedItem.title}
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
                      {selectedItem.title}
                    </h2>

                    <div className="mt-6 border-t border-gray-100 pt-6 text-forest-900 leading-relaxed text-base whitespace-pre-line space-y-4">
                      {cleanContent}
                    </div>

                    <div className="mt-8 flex justify-end border-t border-gray-100 pt-4">
                      <Button
                        onClick={() => setSelectedItem(null)}
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
    </div>
  );
}
