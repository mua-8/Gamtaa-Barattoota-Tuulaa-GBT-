"use client";

import { useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { CalendarDays, ChevronLeft, ChevronRight, MapPin, X } from "lucide-react";
import type { GalleryItem } from "@/lib/data/gallery";

interface LightboxProps {
  items: GalleryItem[];
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

export function Lightbox({ items, index, onClose, onIndexChange }: LightboxProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const item = items[index];

  const prev = useCallback(() => {
    onIndexChange((index - 1 + items.length) % items.length);
  }, [index, items.length, onIndexChange]);

  const next = useCallback(() => {
    onIndexChange((index + 1) % items.length);
  }, [index, items.length, onIndexChange]);

  // Keyboard support + focus management + scroll lock.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = originalOverflow;
      previouslyFocused?.focus();
    };
  }, [onClose, prev, next]);

  if (!item) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Image: ${item.caption}`}
      className="fixed inset-0 z-50 flex flex-col bg-forest-950/95 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="flex items-center justify-between px-4 py-3 text-forest-100 sm:px-6">
        <p className="text-sm font-semibold tabular-nums">
          {index + 1} <span aria-hidden="true">/</span> {items.length}
        </p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close image viewer"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/10"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center px-4 pb-4 sm:px-16" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={prev}
          aria-label="Previous image"
          className="absolute left-3 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-gold-500 hover:text-forest-950 sm:left-6"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>

        <figure className="flex max-h-full w-full max-w-4xl flex-col">
          <div className="relative h-[48vh] w-full overflow-hidden rounded-xl sm:h-[58vh]">
            <Image
              key={item.id}
              src={item.src}
              alt={item.alt}
              fill
              unoptimized
              sizes="(min-width: 1024px) 896px, 100vw"
              className="object-contain"
              priority
            />
          </div>
          <figcaption className="mt-4 rounded-xl bg-white/5 px-5 py-4 text-center">
            <p className="text-sm font-semibold text-white">{item.caption}</p>
            <p className="mt-1.5 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-forest-200">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-gold-400" aria-hidden="true" />
                {item.date}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-gold-400" aria-hidden="true" />
                {item.location}
              </span>
              <span className="inline-flex items-center gap-1.5 font-semibold text-gold-300">
                {item.category}
              </span>
            </p>
          </figcaption>
        </figure>

        <button
          type="button"
          onClick={next}
          aria-label="Next image"
          className="absolute right-3 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-gold-500 hover:text-forest-950 sm:right-6"
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
