/**
 * Global site constants for Gamtaa Barattoota Tuulaa (GBT).
 *
 * Phase 2 note: organization profile data can later be fetched from a
 * Supabase `site_settings` table; keep this module as the single
 * source of truth so the swap is contained to this file.
 */

export const ORG = {
  name: "Gamtaa Barattoota Tuulaa",
  shortName: "GBT",
  tagline: "Learn. Return. Serve. Impact.",
  philosophy: "LEARN → RETURN → SERVE → IMPACT",
  email: "hello@gbtuulaa.org",
  emailHref: "mailto:hello@gbtuulaa.org",
  phone: "+251 911 234 567",
  phoneHref: "tel:+251911234567",
  location: "Tuulaa Town, Eastern Hararghe",
  address: "Eastern Hararghe, Kombolcha City, Tuulaa Town",
  foundedYear: 2021,
  description:
    "Gamtaa Barattoota Tuulaa brings university students together to transform the opportunities they receive into meaningful service for their communities.",
} as const;

export interface NavLink {
  href: string;
  label: string;
}

export const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/programs", label: "Programs" },
  { href: "/impact", label: "Impact" },
  { href: "/gallery", label: "Gallery" },
  { href: "/team", label: "Our Team" },
  { href: "/contact", label: "Contact" },
];

export interface SocialLink {
  name: "Facebook" | "Instagram" | "LinkedIn" | "Telegram" | "YouTube";
  href: string;
}

export const SOCIAL_LINKS: SocialLink[] = [
  { name: "Facebook", href: "https://facebook.com" },
  { name: "Instagram", href: "https://instagram.com" },
  { name: "LinkedIn", href: "https://linkedin.com" },
  { name: "Telegram", href: "https://t.me" },
  { name: "YouTube", href: "https://youtube.com" },
];
