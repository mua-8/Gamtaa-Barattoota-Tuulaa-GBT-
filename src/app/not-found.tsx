import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-lg px-4 text-center sm:px-6">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-forest-100 text-forest-800">
          <Compass className="h-7 w-7" aria-hidden="true" />
        </span>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.22em] text-gold-600">404</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-forest-950 sm:text-4xl">
          This path doesn&apos;t exist — yet.
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          The page you&apos;re looking for may have moved, or it&apos;s still being built. Let&apos;s
          get you back to the community.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="bg-forest-800 text-white hover:bg-forest-700">
            <Link href="/">
              Back to Home
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-forest-300 text-forest-900 hover:bg-forest-50">
            <Link href="/programs">Explore Programs</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
