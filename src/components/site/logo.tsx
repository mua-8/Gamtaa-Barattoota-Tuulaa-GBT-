import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoMarkProps {
  className?: string;
}

/** The official GBT emblem (provided artwork, transparent background). */
export function LogoMark({ className }: LogoMarkProps) {
  return (
    <Image
      src="/images/logo.png"
      alt="Gamtaa Barattoota Tuulaa emblem"
      width={645}
      height={513}
      className={cn("h-8 w-8 sm:h-14 sm:w-14 lg:h-16 lg:w-16 object-contain rounded-full shrink-0", className)}
      priority
    />
  );
}

interface LogoProps {
  className?: string;
  /** Light variant for dark backgrounds (header/footer). */
  variant?: "default" | "light";
}

export function Logo({ className, variant = "default" }: LogoProps) {
  const light = variant === "light";
  return (
    <span className={cn("inline-flex items-center gap-1.5 sm:gap-3", className)}>
      <LogoMark />
      <span className="flex flex-col leading-tight min-w-0">
        <span
          className={cn(
            "font-sans text-[13px] sm:text-lg lg:text-xl font-bold tracking-tight whitespace-nowrap",
            light ? "text-white" : "text-forest-950"
          )}
        >
          Gamtaa Barattoota Tuulaa
        </span>
        <span
          className={cn(
            "text-[clamp(8px,2.5vw,11px)] lg:text-xs font-medium tracking-wider uppercase opacity-75 whitespace-nowrap",
            light ? "text-forest-100" : "text-forest-600"
          )}
        >
          Empowering Our Community
        </span>
      </span>
    </span>
  );
}
