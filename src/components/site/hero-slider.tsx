"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface HeroSlide {
  src: string;
  alt: string;
  position?: string;
}

interface HeroSliderProps {
  slides: HeroSlide[];
  children: React.ReactNode;
}

export function HeroSlider({ slides, children }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsPlaying(false);
    }
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  useEffect(() => {
    if (isPlaying && !isHovered) {
      timerRef.current = window.setInterval(nextSlide, 5000);
    }
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [isPlaying, isHovered, nextSlide]);

  return (
    <section 
      className="relative w-full h-[600px] min-h-[85svh] max-h-[800px] overflow-hidden bg-forest-950"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Hero Showcase"
    >
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.src}
          role="group"
          aria-roledescription="slide"
          aria-hidden={index !== currentIndex}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 ease-in-out",
            index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
          )}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            priority={index === 0}
            sizes="100vw"
            className={cn("object-cover", slide.position || "object-center")}
          />
          {/* Subtle dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-forest-950/90 via-forest-950/70 to-transparent" />
          <div className="absolute inset-0 bg-forest-950/40 sm:bg-forest-950/20" />
        </div>
      ))}

      {/* Content overlay */}
      <div className="relative z-10 h-full w-full mx-auto max-w-7xl flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-20">
        {children}
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-between items-end px-4 sm:px-8 max-w-7xl mx-auto pointer-events-none">
        
        {/* Play/Pause (Accessibility) */}
        <div className="pointer-events-auto">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gold-400"
            aria-label={isPlaying ? "Pause slider" : "Play slider"}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        </div>

        {/* Dots */}
        <div className="flex items-center gap-3 pointer-events-auto bg-black/20 px-4 py-2 rounded-full backdrop-blur-md">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === currentIndex}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === currentIndex 
                  ? "w-8 bg-gold-400" 
                  : "w-2 bg-white/60 hover:bg-white focus:outline-none focus:ring-2 focus:ring-gold-400"
              )}
            />
          ))}
        </div>

        {/* Arrows */}
        <div className="flex gap-2 pointer-events-auto">
          <button
            onClick={prevSlide}
            className="p-3 rounded-full border border-white/20 bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gold-400"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="p-3 rounded-full border border-white/20 bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gold-400"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

      </div>
    </section>
  );
}
