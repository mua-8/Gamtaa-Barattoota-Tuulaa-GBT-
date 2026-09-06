"use client";

import { useState } from "react";
import Link from "next/link";
import { Award, Bell, BookOpen, Check, CheckCheck, ClipboardList, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markNotificationRead, markAllNotificationsRead } from "@/lib/actions/student";
import { cn } from "@/lib/utils";

export interface DashboardNotificationItem {
  id: string;
  title: string;
  message: string | null;
  type: string;
  read: boolean;
  created_at: string;
}

const TYPE_ICONS: Record<string, typeof Bell> = {
  application: ClipboardList,
  program: BookOpen,
  service: Clock,
  certificate: Award,
  info: Bell,
};

export function DashboardNotifications({ initialItems }: { initialItems: DashboardNotificationItem[] }) {
  const [items, setItems] = useState<DashboardNotificationItem[]>(initialItems);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const unreadCount = items.filter((n) => !n.read).length;

  const handleMarkRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    // Optimistic update
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await markNotificationRead(id);
  };

  const handleMarkAllRead = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    await markAllNotificationsRead();
  };

  const toggleExpand = (id: string, isRead: boolean) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      if (!isRead) {
        handleMarkRead(id);
      }
    }
  };

  return (
    <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-lg font-bold text-forest-950">Recent notifications</h2>
          {unreadCount > 0 && (
            <span className="rounded-full bg-gold-400/30 text-forest-900 border border-gold-500/30 px-2 py-0.5 text-xs font-bold">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-semibold text-forest-700 hover:text-forest-950 hover:underline flex items-center gap-1"
            >
              <CheckCheck className="h-3.5 w-3.5" /> Mark all read
            </button>
          )}
          <Link
            href="/student/notifications"
            className="text-xs font-bold text-forest-800 underline-offset-4 hover:underline"
          >
            View all
          </Link>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">Nothing yet — updates land here.</p>
      ) : (
        <ul className="mt-4 space-y-2.5">
          {items.map((n) => {
            const Icon = TYPE_ICONS[n.type] ?? Bell;
            const isExpanded = expandedId === n.id;

            return (
              <li
                key={n.id}
                onClick={() => toggleExpand(n.id, n.read)}
                className={cn(
                  "group relative rounded-lg border p-3 text-sm transition-all cursor-pointer",
                  n.read
                    ? "border-gray-100 bg-white hover:bg-gray-50/75"
                    : "border-gold-300/80 bg-gold-50/50 hover:bg-gold-50"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <span
                      className={cn(
                        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                        n.read
                          ? "bg-gray-100 text-gray-500"
                          : "bg-gold-200 text-forest-900 font-bold"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {!n.read && (
                          <span className="h-2 w-2 rounded-full bg-gold-500 shrink-0" />
                        )}
                        <p className={cn("text-sm", n.read ? "font-medium text-gray-800" : "font-bold text-forest-950")}>
                          {n.title}
                        </p>
                      </div>
                      {n.message && (
                        <p
                          className={cn(
                            "mt-1 text-xs text-muted-foreground leading-relaxed",
                            !isExpanded && "line-clamp-1"
                          )}
                        >
                          {n.message}
                        </p>
                      )}
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {new Date(n.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  {!n.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleMarkRead(n.id, e)}
                      className="h-7 px-2 text-xs text-forest-700 hover:text-forest-950 hover:bg-gold-200/50 shrink-0"
                    >
                      <Check className="h-3.5 w-3.5 mr-1" /> Read
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
