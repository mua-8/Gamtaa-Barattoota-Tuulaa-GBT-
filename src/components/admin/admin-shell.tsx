"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart,
  BookOpen,
  ClipboardList,
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Mail,
  Megaphone,
  MessageSquareQuote,
  Settings,
  Users,
  Menu,
  X,
  ArrowLeft,
  Globe,
} from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/site/logo";

const OPERATIONS_NAV = [
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/applications", label: "Applications", icon: FileText },
  { href: "/admin/service-records", label: "Service Records", icon: ClipboardList },
  { href: "/admin/certificates", label: "Certificates", icon: FileText },
  { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
];

const CMS_NAV = [
  { href: "/admin/home", label: "Home Page", icon: FileText },
  { href: "/admin/about", label: "About Page", icon: FileText },
  { href: "/admin/programs", label: "Programs", icon: BookOpen },
  { href: "/admin/impact", label: "Impact Metrics", icon: BarChart },
  { href: "/admin/gallery", label: "Photo Gallery", icon: ImageIcon },
  { href: "/admin/team", label: "Our Team", icon: Users },
  { href: "/admin/contact", label: "Contact Info", icon: ClipboardList },
  { href: "/admin/messages", label: "Messages Inbox", icon: Mail },
];

interface AdminShellProps {
  userRole: "admin" | "super_admin";
  children: React.ReactNode;
}

export function AdminShell({ userRole, children }: AdminShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Prevent scrolling when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const renderNavLink = (item: { href: string; label: string; icon: any }) => {
    const active =
      item.href === "/admin"
        ? pathname === "/admin"
        : pathname.startsWith(item.href);

    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors whitespace-nowrap",
          active
            ? "bg-forest-900 text-gold-400 font-bold"
            : "text-forest-300 hover:bg-forest-900 hover:text-white"
        )}
      >
        <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
        {item.label}
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-cream lg:bg-transparent">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-forest-950/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ADMIN TOP HEADER (Spans full width) */}
      <header className="sticky top-0 z-50 flex h-20 shrink-0 items-center justify-between border-b border-forest-800 bg-forest-950 px-4 shadow-sm lg:px-8">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-forest-100 hover:bg-forest-900 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
          <Link href="/admin" className="focus-visible:outline-ring block min-w-0">
            <Logo variant="light" />
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-forest-300 hover:text-white font-medium px-3 py-1.5 rounded-md hover:bg-forest-900 transition-colors"
          >
            <Globe className="h-3.5 w-3.5" />
            View Public Site
          </Link>
          <span className="rounded-full bg-forest-900 border border-forest-800 px-3 py-1 text-xs font-semibold text-gold-400 uppercase tracking-wide">
            {userRole === "super_admin" ? "Super Admin" : "Admin"}
          </span>
        </div>
      </header>

      <div className="flex flex-1 relative min-h-0">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 top-20 left-0 z-40 flex w-72 flex-col bg-forest-950 text-forest-100 shadow-xl transition-transform duration-300 lg:translate-x-0 lg:border-r lg:border-forest-800 lg:shadow-none",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-between px-4 h-16 lg:hidden border-b border-forest-800">
            <span className="text-sm font-bold uppercase text-forest-400">Navigation</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-forest-100 rounded-md hover:bg-forest-900"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav aria-label="Admin portal" className="flex-1 overflow-y-auto px-4 py-5 space-y-5 custom-scrollbar">
            {/* Dashboard Overview */}
            <div className="space-y-1">
              {renderNavLink({ href: "/admin", label: "Dashboard", icon: LayoutDashboard })}
            </div>

            {/* Operations Section */}
            <div className="space-y-1">
              <div className="px-3 pb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-forest-400">
                  Operations
                </span>
              </div>
              {OPERATIONS_NAV.map((item) => renderNavLink(item))}
            </div>

            {/* CMS Section (Super Admin only) */}
            {userRole === "super_admin" && (
              <div className="space-y-1">
                <div className="px-3 pb-1 pt-2 border-t border-forest-800/80">
                  <span className="text-xs font-bold uppercase tracking-wider text-forest-400">
                    Website CMS
                  </span>
                </div>
                {CMS_NAV.map((item) => renderNavLink(item))}
              </div>
            )}

            {/* System Section (Super Admin only) */}
            {userRole === "super_admin" && (
              <div className="space-y-1">
                <div className="px-3 pb-1 pt-2 border-t border-forest-800/80">
                  <span className="text-xs font-bold uppercase tracking-wider text-forest-400">
                    System
                  </span>
                </div>
                {renderNavLink({
                  href: "/admin/settings",
                  label: "Settings & Audit Logs",
                  icon: Settings,
                })}
              </div>
            )}

            {/* Quick Links & Logout */}
            <div className="pt-4 border-t border-forest-800 space-y-2">
              <Link
                href="/student/dashboard"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-gold-400 bg-forest-900/60 hover:bg-forest-900 border border-gold-500/20 transition-colors whitespace-nowrap"
              >
                <ArrowLeft className="h-4 w-4 shrink-0" />
                Volunteer Dashboard
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-forest-300 transition-colors hover:bg-forest-900 hover:text-white whitespace-nowrap"
                >
                  <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
                  Logout
                </button>
              </form>
            </div>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 sm:p-8 lg:p-12 w-full max-w-7xl mx-auto lg:pl-80">
          {children}
        </main>
      </div>
    </div>
  );
}
