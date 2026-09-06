"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, LogIn, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/site/logo";
import { NAV_LINKS } from "@/lib/site";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close on Escape for keyboard users.
  useEffect(() => {
    if (!menuOpen) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // If window is resized to desktop, close menu
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1280 && menuOpen) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [menuOpen]);

  if (pathname.startsWith("/student") || pathname.startsWith("/admin")) return null;

  return (
    <>
      <header className="sticky top-0 z-40 bg-forest-950 shadow-lg shadow-forest-950/30">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 xl:gap-4 px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
          
          {/* Block 1: Brand / Logo (Left) */}
          <div className="flex items-center shrink-0">
            <Link
              href="/"
              aria-label="Gamtaa Barattoota Tuulaa — home"
              className="rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring shrink-0"
            >
              <Logo variant="light" className="shrink-0" />
            </Link>
          </div>

        {/* Block 2: Nav Links (Center) */}
        <nav aria-label="Primary" className="hidden xl:flex items-center text-xs 2xl:text-sm font-medium">
          <ul className="flex items-center gap-3.5 2xl:gap-6">
            {NAV_LINKS.map((link) => {
              const active =
                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "transition-colors duration-200 whitespace-nowrap py-1 px-1.5 rounded-md hover:text-white",
                      active
                        ? "text-gold-400 font-bold"
                        : "text-forest-100"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Block 3: Action Buttons (Right) */}
        <div className="hidden xl:flex items-center gap-3 2xl:gap-4 shrink-0">
          <Link 
            href="/student/dashboard" 
            className="text-xs 2xl:text-sm font-medium flex items-center gap-1.5 2xl:gap-2 text-forest-100 hover:text-white transition-colors duration-200 whitespace-nowrap py-1 px-2"
          >
            <LogIn className="h-4 w-4" aria-hidden="true" />
            Volunteer Portal
          </Link>
          <Link 
            href="/join" 
            className="text-xs 2xl:text-sm font-semibold bg-gold-500 text-forest-950 px-4 py-2 2xl:px-5 2xl:py-2.5 rounded-full hover:bg-gold-400 transition-colors duration-200 whitespace-nowrap shadow-sm"
          >
            Join GBT
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-forest-900 border border-forest-800 text-white xl:hidden select-none hover:bg-forest-800 transition-colors"
          style={{ touchAction: "manipulation" }}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
        </button>
      </div>

      </header>

      {/* Mobile navigation (Rendered outside sticky header to fix iOS Safari fixed bug) */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-forest-950 xl:hidden overflow-hidden">
          {/* Mobile Header inside the menu */}
          <div className="flex h-[72px] shrink-0 items-center justify-between px-4 border-b border-forest-800 shadow-sm">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              aria-label="Gamtaa Barattoota Tuulaa — home"
            >
              <Logo variant="light" />
            </Link>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-forest-800 text-white hover:bg-forest-700"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <nav
            id="mobile-navigation"
            aria-label="Primary mobile"
            className="flex-1 overflow-y-auto"
          >
            <ul className="space-y-2 px-4 py-6">
              {NAV_LINKS.map((link) => {
                const active =
                  link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "block rounded-xl px-5 py-3.5 text-lg font-bold transition-colors",
                        active
                          ? "bg-forest-900 text-gold-400"
                          : "text-forest-100 hover:bg-forest-900 hover:text-white"
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
              <li className="mt-8 flex flex-col gap-3 pt-6 border-t border-forest-800">
                <Link
                  href="/student/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-forest-700 bg-transparent px-5 py-4 text-lg font-bold text-forest-100 hover:bg-forest-900"
                >
                  <LogIn className="h-5 w-5" aria-hidden="true" />
                  Volunteer Portal
                </Link>
                <Link
                  href="/join"
                  onClick={() => setMenuOpen(false)}
                  className="flex w-full items-center justify-center rounded-xl bg-gold-500 px-5 py-4 text-lg font-bold text-forest-950 hover:bg-gold-400"
                >
                  Join GBT
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </>
  );
}
