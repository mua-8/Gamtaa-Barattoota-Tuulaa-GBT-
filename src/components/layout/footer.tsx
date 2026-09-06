"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, MapPin, Phone } from "lucide-react";
import { LogoMark } from "@/components/site/logo";
import { SocialIcons } from "@/components/site/social-icons";
import { NAV_LINKS, ORG } from "@/lib/site";

const PROGRAM_LINKS = [
  { label: "Free Summer Education", href: "/programs/tuulaa-summer-school" },
  { label: "Student Mentorship", href: "/programs/bridge-to-university" },
  { label: "Digital Literacy", href: "/programs/digital-horizons" },
  { label: "Community Service", href: "/programs/green-roots-service-day" },
  { label: "Tolerance & Peace", href: "/programs/bridges-of-tolerance" },
];

/** Repeating official-emblem watermark, like the brand footer artwork. */
function EmblemPattern() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 opacity-[0.06]"
      style={{
        backgroundImage: "url(/images/logo.png)",
        backgroundSize: "150px auto",
        backgroundRepeat: "repeat",
      }}
    />
  );
}

export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/student") || pathname.startsWith("/admin")) return null;

  return (
    <footer className="relative bg-forest-950 text-forest-100">
      <EmblemPattern />

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {/* Centered emblem */}
        <div className="flex flex-col items-center text-center">
          <LogoMark className="h-24 w-24" />
          <p className="mt-4 font-display text-2xl font-bold text-white">{ORG.name}</p>
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-gold-400">
            Empowering Our Community
          </p>
          <SocialIcons variant="light" className="mt-5" />
        </div>

        {/* Link columns */}
        <div className="mt-12 grid gap-10 border-t border-forest-800 pt-10 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <nav aria-label="Footer — explore">
            <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-forest-400">Explore</h2>
            <ul className="mt-4 space-y-2.5">
              {NAV_LINKS.filter((l) => l.href !== "/").map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-forest-100 transition-colors hover:text-gold-300">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/join" className="font-bold text-gold-400 hover:text-gold-300">
                  Join GBT
                </Link>
              </li>
              <li>
                <Link href="/student/dashboard" className="text-forest-100 transition-colors hover:text-gold-300">
                  Volunteer Portal
                </Link>
              </li>
              <li>
                <Link href="/join-team" className="text-forest-100 transition-colors hover:text-gold-300">
                  Join as Team
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Footer — programs">
            <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-forest-400">Programs</h2>
            <ul className="mt-4 space-y-2.5">
              {PROGRAM_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-forest-100 transition-colors hover:text-gold-300">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-forest-400">Contact</h2>
            <ul className="mt-4 space-y-3 text-forest-100">
              <li className="flex gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" aria-hidden="true" />
                {ORG.address}
              </li>
              <li>
                <a href={ORG.emailHref} className="flex gap-2.5 hover:text-gold-300">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" aria-hidden="true" />
                  {ORG.email}
                </a>
              </li>
              <li>
                <a href={ORG.phoneHref} className="flex gap-2.5 hover:text-gold-300">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" aria-hidden="true" />
                  {ORG.phone}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-forest-400">Our Philosophy</h2>
            <p className="mt-4 leading-relaxed text-forest-100">{ORG.description}</p>
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-gold-400">
              {ORG.philosophy}
            </p>
          </div>
        </div>
      </div>

      <div className="relative border-t border-forest-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-forest-300 sm:flex-row sm:px-6 lg:px-8">
          <p>© 2026 Gamtaa Barattoota Tuulaa. All rights reserved.</p>
          <p>Built by students, for the community.</p>
        </div>
      </div>
    </footer>
  );
}
