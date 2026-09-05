import { ArrowRight, GraduationCap, HeartHandshake, Home, Sparkles } from "lucide-react";

const STEPS = [
  { label: "Learn", icon: GraduationCap },
  { label: "Return", icon: Home },
  { label: "Serve", icon: HeartHandshake },
  { label: "Impact", icon: Sparkles },
];

/** Visual representation of LEARN → RETURN → SERVE → IMPACT (dark surfaces). */
export function PhilosophyStrip({ className }: { className?: string }) {
  return (
    <ol className={className} aria-label="Our philosophy: Learn, Return, Serve, Impact">
      {STEPS.map((step, i) => (
        <li key={step.label} className="flex items-center gap-3 sm:gap-4">
          <span className="flex items-center gap-2.5 rounded-full border border-forest-700 bg-forest-900/70 px-4 py-2 shadow-sm backdrop-blur">
            <step.icon className="h-4 w-4 text-forest-300" aria-hidden="true" />
            <span className="text-sm font-bold uppercase tracking-wider text-white">
              {step.label}
            </span>
          </span>
          {i < STEPS.length - 1 && (
            <ArrowRight className="h-4 w-4 shrink-0 text-gold-400" aria-hidden="true" />
          )}
        </li>
      ))}
    </ol>
  );
}
