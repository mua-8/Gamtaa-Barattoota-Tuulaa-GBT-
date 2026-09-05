import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarDays, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { Program } from "@/lib/data/programs";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: Program["status"] }) {
  return (
    <Badge
      className={cn(
        "border-transparent",
        status === "Active" && "bg-forest-600 text-white hover:bg-forest-600",
        status === "Upcoming" && "bg-gold-400 text-forest-950 hover:bg-gold-400",
        status === "Completed" && "bg-stone-500 text-white hover:bg-stone-500"
      )}
    >
      {status}
    </Badge>
  );
}

interface ProgramCardProps {
  program: Program;
}

export function ProgramCard({ program }: ProgramCardProps) {
  return (
    <Card className="group flex h-full flex-col overflow-hidden shadow-sm transition-shadow hover:shadow-md">
      <div className="relative h-52 w-full overflow-hidden">
        <Image
          src={program.image}
          alt={program.imageAlt}
          fill
          sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge className="border-transparent bg-white/95 text-forest-900 hover:bg-white">
            {program.category}
          </Badge>
        </div>
        <div className="absolute right-3 top-3">
          <StatusBadge status={program.status} />
        </div>
      </div>
      <CardContent className="flex flex-1 flex-col gap-3 p-6">
        <h3 className="font-display text-lg font-bold text-forest-950">
          <Link
            href={`/programs/${program.slug}`}
            className="transition-colors hover:text-forest-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            {program.title}
          </Link>
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{program.shortDescription}</p>
        <dl className="mt-auto space-y-1.5 pt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-forest-600" aria-hidden="true" />
            <dd>{program.location}</dd>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-3.5 w-3.5 text-forest-600" aria-hidden="true" />
            <dd>{program.date}</dd>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-forest-600" aria-hidden="true" />
            <dd>{program.participants}</dd>
          </div>
        </dl>
      </CardContent>
      <CardFooter className="border-t border-border bg-cream p-4">
        <Link
          href={`/programs/${program.slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-forest-800 transition-colors hover:text-gold-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          View Details
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </CardFooter>
    </Card>
  );
}
