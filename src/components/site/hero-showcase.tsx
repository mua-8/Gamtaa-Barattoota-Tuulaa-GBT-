import Image from "next/image";

interface HeroShowcaseProps {
  imageSrc: string;
  imageAlt: string;
  children: React.ReactNode;
}

export function HeroShowcase({ imageSrc, imageAlt, children }: HeroShowcaseProps) {
  return (
    <section className="relative w-full min-h-[100svh] sm:min-h-[85svh] lg:min-h-0 lg:h-[600px] lg:max-h-[800px] overflow-hidden bg-forest-950 flex flex-col">
      <div className="absolute inset-0 z-0">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Subtle dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-forest-950/90 via-forest-950/70 to-transparent" />
        <div className="absolute inset-0 bg-forest-950/50 sm:bg-forest-950/40 lg:bg-forest-950/20" />
      </div>

      {/* Content overlay — flex-1 so it fills the full min-height on mobile */}
      <div className="relative z-10 flex-1 w-full mx-auto max-w-7xl flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        {children}
      </div>
    </section>
  );
}
