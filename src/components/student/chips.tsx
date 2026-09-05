"use client";

import { cn } from "@/lib/utils";

export function Chips({
  options,
  selected,
  onToggle,
  label,
}: {
  options: readonly string[];
  selected: string[];
  onToggle: (value: string) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            aria-pressed={active}
            onClick={() => onToggle(option)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
              active
                ? "border-forest-800 bg-forest-800 text-white"
                : "border-border bg-white text-muted-foreground hover:border-forest-300 hover:text-forest-800"
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
