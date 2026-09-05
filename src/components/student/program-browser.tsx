"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, MapPin, Search, SearchX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface BrowseProgram {
  id: string;
  title: string;
  category: string | null;
  description: string | null;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
}

const ALL = "All";

export function ProgramBrowser({ programs }: { programs: BrowseProgram[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(ALL);

  const categories = useMemo(
    () => [ALL, ...Array.from(new Set(programs.map((p) => p.category ?? "Other")))],
    [programs]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return programs.filter((p) => {
      const inCategory = category === ALL || (p.category ?? "Other") === category;
      const inQuery =
        q.length === 0 ||
        p.title.toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q) ||
        (p.location ?? "").toLowerCase().includes(q);
      return inCategory && inQuery;
    });
  }, [programs, query, category]);

  return (
    <div>
      <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,300px)_1fr] lg:items-end">
          <div>
            <Label htmlFor="sp-search">Search programs</Label>
            <div className="relative mt-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input id="sp-search" type="search" placeholder="Search…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
            </div>
          </div>
          <div role="group" aria-label="Filter by category">
            <p className="text-sm font-semibold text-foreground">Category</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {categories.map((c) => (
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

      <p role="status" className="mt-5 text-sm font-semibold text-muted-foreground">
        {filtered.length} program{filtered.length === 1 ? "" : "s"}
      </p>

      {filtered.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-border bg-white py-14 text-center">
          <SearchX className="mx-auto h-9 w-9 text-muted-foreground" aria-hidden="true" />
          <p className="mt-3 text-sm text-muted-foreground">No programs match your filters.</p>
        </div>
      ) : (
        <ul className="mt-5 grid gap-5 sm:grid-cols-2">
          {filtered.map((p) => (
            <li key={p.id}>
              <Link
                href={`/student/programs/${p.id}`}
                className="block h-full rounded-xl border border-border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-3">
                  <Badge className="border-transparent bg-forest-100 text-forest-800 hover:bg-forest-100">
                    {p.category ?? "Other"}
                  </Badge>
                  <Badge
                    className={cn(
                      "border-transparent capitalize",
                      p.status === "active" && "bg-forest-600 text-white hover:bg-forest-600",
                      p.status === "upcoming" && "bg-gold-400 text-forest-950 hover:bg-gold-400",
                      p.status === "completed" && "bg-stone-500 text-white hover:bg-stone-500"
                    )}
                  >
                    {p.status}
                  </Badge>
                </div>
                <h3 className="mt-3 font-display text-lg font-bold text-forest-950">{p.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
                <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {p.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-forest-600" aria-hidden="true" />
                      {p.location}
                    </span>
                  )}
                  {p.start_date && (
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="h-3 w-3 text-forest-600" aria-hidden="true" />
                      {p.start_date} → {p.end_date ?? "…"}
                    </span>
                  )}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
