import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoMarkProps {
  className?: string;
  compact?: boolean;
}

/** The official GBT emblem (provided artwork, transparent background). */
export function LogoMark({ className, compact = false }: LogoMarkProps) {
  return (
    <Image
      src="/images/logo.png"
      alt="Gamtaa Barattoota Tuulaa emblem"
      width={645}
      height={513}
      className={cn(
        compact
          ? "h-9 w-9 shrink-0 object-contain rounded-full"
          : "h-9 w-9 sm:h-11 sm:w-11 lg:h-12 lg:w-12 object-contain rounded-full shrink-0",
        className
      )}
      priority
    />
  );
}

interface LogoProps {
  className?: string;
  /** Light variant for dark backgrounds (header/footer). */
  variant?: "default" | "light";
  compact?: boolean;
}

export function Logo({ className, variant = "default", compact = false }: LogoProps) {
  const light = variant === "light";
  return (
    <span className={cn("inline-flex items-center gap-2.5 sm:gap-3 shrink-0", className)}>
      <LogoMark compact={compact} />
      <span className="flex flex-col leading-tight shrink-0">
        <span
          className={cn(
            compact
              ? "font-sans text-sm font-bold tracking-tight truncate"
              : "font-sans text-sm sm:text-base xl:text-lg font-bold tracking-tight whitespace-nowrap",
            light ? "text-white" : "text-forest-950"
          )}
        >
          Gamtaa Barattoota Tuulaa
        </span>
        <span
          className={cn(
            compact
              ? "text-[9px] font-bold tracking-wider uppercase truncate text-gold-400"
              : "text-[9px] sm:text-[10px] xl:text-[11px] font-bold tracking-[0.16em] sm:tracking-[0.18em] uppercase whitespace-nowrap",
            light ? "text-gold-400" : "text-gold-600"
          )}
        >
          Empowering Our Community
        </span>
      </span>
    </span>
  );
}
