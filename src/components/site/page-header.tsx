import { Waves } from "@/components/site/waves";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
}

/** Dark teal hero band with brand waves, used at the top of interior pages. */
export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <section className="relative overflow-hidden bg-forest-950 text-white">
      <Waves className="pointer-events-none absolute inset-0 h-full w-full opacity-60" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-400">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold tracking-tight sm:text-5xl">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-forest-100 sm:text-lg">
          {description}
        </p>
      </div>
    </section>
  );
}
