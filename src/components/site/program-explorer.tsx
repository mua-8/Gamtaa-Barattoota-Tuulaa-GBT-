"use client";

import { useMemo, useState } from "react";
import { Search, SearchX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProgramCard } from "@/components/site/program-card";
import { PROGRAM_CATEGORIES, PROGRAMS, Program } from "@/lib/data/programs";
import { cn } from "@/lib/utils";

const ALL = "All Programs";

export function ProgramExplorer({ initialPrograms }: { initialPrograms?: Program[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>(ALL);

  const displayPrograms = initialPrograms && initialPrograms.length > 0 ? initialPrograms : PROGRAMS;
  
  const categories = useMemo(() => {
    const cats = new Set(displayPrograms.map(p => p.category));
    return Array.from(cats).sort();
  }, [displayPrograms]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return displayPrograms.filter((p) => {
      const matchesCategory = category === ALL || p.category === category;
      const matchesQuery =
        q.length === 0 ||
        p.title.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, category, displayPrograms]);

  return (
    <div>
      {/* Controls */}
      <div className="rounded-xl border border-border bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,320px)_1fr] lg:items-end">
          <div>
            <Label htmlFor="program-search" className="text-sm font-semibold text-foreground">
              Search programs
            </Label>
            <div className="relative mt-2">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="program-search"
                type="search"
                placeholder="Try “mentorship” or “Tuulaa”…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div role="group" aria-label="Filter programs by category">
            <p className="text-sm font-semibold text-foreground">Category</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {[ALL, ...categories].map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={category === c}
                  onClick={() => setCategory(c)}
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
          </div>
        </div>
      </div>

      <p className="mt-6 text-sm font-semibold text-muted-foreground" role="status">
        Showing {filtered.length} of {displayPrograms.length} programs
      </p>

      {filtered.length > 0 ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((program) => (
            <ProgramCard key={program.slug} program={program} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-dashed border-border bg-white py-16 text-center">
          <SearchX className="mx-auto h-10 w-10 text-muted-foreground" aria-hidden="true" />
          <h3 className="mt-4 font-display text-lg font-bold text-forest-950">No programs found</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Try a different search term or category — or clear the filters to see everything we do.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCategory(ALL);
            }}
            className="mt-5 text-sm font-bold text-forest-800 underline underline-offset-4 hover:text-gold-600"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
