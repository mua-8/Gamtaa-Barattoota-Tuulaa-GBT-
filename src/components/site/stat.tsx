"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

function useCountUp(target: number, start: boolean, duration = 1400) {
  const reduced = usePrefersReducedMotion();
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start || reduced) return;
    let frame: number;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [start, reduced, target, duration]);
  return reduced ? target : value;
}

interface StatProps {
  value: number;
  suffix?: string;
  label: string;
  description?: string;
  variant?: "light" | "dark";
  className?: string;
}

/** Animated impact statistic. Values will later be sourced from Supabase. */
export function Stat({ value, suffix = "", label, description, variant = "light", className }: StatProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const current = useCountUp(value, inView);

  return (
    <div ref={ref} className={cn("text-center", className)}>
      <p
        className={cn(
          "font-display text-4xl font-bold tracking-tight tabular-nums sm:text-5xl",
          variant === "dark" ? "text-gold-400" : "text-forest-900"
        )}
      >
        {current.toLocaleString("en-US")}
        <span className={variant === "dark" ? "text-gold-300" : "text-gold-500"}>{suffix}</span>
      </p>
      <p
        className={cn(
          "mt-2 text-sm font-bold uppercase tracking-wider",
          variant === "dark" ? "text-white" : "text-foreground"
        )}
      >
        {label}
      </p>
      {description && (
        <p
          className={cn(
            "mt-1 text-xs leading-relaxed",
            variant === "dark" ? "text-forest-200" : "text-muted-foreground"
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
