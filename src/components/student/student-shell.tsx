"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  Bell,
  BookOpen,
  ClipboardList,
  History,
  LayoutDashboard,
  LogOut,
  Settings,
  UserRound,
  Menu,
  X,
} from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/site/logo";

const NAV = [
  { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/profile", label: "My Profile", icon: UserRound },
  { href: "/student/programs", label: "Volunteer Activities", icon: BookOpen },
  { href: "/student/my-programs", label: "My Activities", icon: ClipboardList },
  { href: "/student/service-history", label: "Service History", icon: History },
  { href: "/student/certificates", label: "Certificates", icon: Award },
  { href: "/student/notifications", label: "Notifications", icon: Bell },
  { href: "/student/settings", label: "Settings", icon: Settings },
];

interface StudentShellProps {
  unread: number;
  children: React.ReactNode;
}

export function StudentShell({ unread, children }: StudentShellProps) {
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
    <div className="flex min-h-screen bg-cream lg:bg-transparent">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-forest-950/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar (Mobile + Desktop) */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-forest-950 text-forest-100 shadow-xl transition-transform duration-300 lg:translate-x-0 lg:border-r lg:border-forest-800 lg:shadow-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-4 h-24 lg:hidden border-b border-forest-800">
          <div><Logo variant="light" /></div>
          <button onClick={() => setSidebarOpen(false)} className="p-2 text-forest-100 rounded-md hover:bg-forest-900">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="hidden lg:flex h-24 shrink-0 items-center px-6 border-b border-forest-800">
           <Link href="/student/dashboard" className="focus-visible:outline-ring block">
             <Logo variant="light" />
           </Link>
        </div>
        
        <nav aria-label="Volunteer portal" className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
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
                {item.href === "/student/notifications" && unread > 0 && (
                  <span className="ml-auto rounded-full bg-gold-400 px-2 py-0.5 text-xs font-bold text-forest-950">
                    {unread}
                  </span>
                )}
              </Link>
            );
          })}
          
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
      <div className="flex flex-1 flex-col min-w-0 lg:pl-72">
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-forest-800 bg-forest-950 px-4 shadow-sm lg:hidden">
          <button
            type="button"
            className="-ml-2 inline-flex items-center justify-center rounded-md p-2 text-forest-100 hover:bg-forest-900"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
          <div>
            <Logo variant="light" />
          </div>
        </header>

        <main className="flex-1 p-6 sm:p-8 lg:p-12 w-full max-w-6xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
