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
  UserCheck,
  Menu,
  X,
  ShieldAlert
} from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/site/logo";

const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/applications", label: "Applications", icon: FileText },
  { href: "/admin/service-records", label: "Service Records", icon: ClipboardList },
  { href: "/admin/certificates", label: "Certificates", icon: FileText },
  { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
];

const SUPER_ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/home", label: "Home", icon: FileText },
  { href: "/admin/about", label: "About", icon: FileText },
  { href: "/admin/programs", label: "Programs", icon: BookOpen },
  { href: "/admin/impact", label: "Impact", icon: BarChart },
  { href: "/admin/gallery", label: "Gallery", icon: ImageIcon },
  { href: "/admin/team", label: "Our Team", icon: Users },
  { href: "/admin/contact", label: "Contact", icon: ClipboardList },
  { href: "/admin/messages", label: "Messages", icon: Mail },
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
        <div className="flex items-center gap-4">
           {/* Add user profile / logout button to header if desired, but we have it in sidebar */}
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
            <button onClick={() => setSidebarOpen(false)} className="p-2 text-forest-100 rounded-md hover:bg-forest-900">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <nav aria-label="Admin portal" className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 custom-scrollbar">
            <div className="mb-4 px-3">
              <span className="text-xs font-bold uppercase tracking-wider text-forest-400">
                {userRole === "super_admin" ? "Super Admin" : "Admin Portal"}
              </span>
            </div>

            {(userRole === "super_admin" ? [...ADMIN_NAV.filter(n => n.href !== '/admin'), ...SUPER_ADMIN_NAV] : ADMIN_NAV).map((item) => {
              const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition-colors whitespace-nowrap",
                    active
                      ? "bg-forest-900 text-gold-400"
                      : "text-forest-300 hover:bg-forest-900 hover:text-white"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
            
            {userRole === "super_admin" && (
              <>
                <div className="mt-6 mb-2 px-3 pt-4 border-t border-forest-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-forest-400">System</span>
                </div>
                <Link
                  href="/admin/settings"
                  aria-current={pathname.startsWith("/admin/settings") ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition-colors whitespace-nowrap",
                    pathname.startsWith("/admin/settings")
                      ? "bg-forest-900 text-gold-400"
                      : "text-forest-300 hover:bg-forest-900 hover:text-white"
                  )}
                >
                  <Settings className="h-5 w-5 shrink-0" aria-hidden="true" />
                  Settings & Logs
                </Link>
              </>
            )}

            <div className="pt-6 mt-6 border-t border-forest-800">
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-forest-300 transition-colors hover:bg-forest-900 hover:text-white whitespace-nowrap"
                >
                  <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
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
