"use client";

import { useState } from "react";
import { Award, Bell, BookOpen, Check, CheckCheck, ClipboardList, Clock, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markNotificationRead, markAllNotificationsRead } from "@/lib/actions/student";
import { cn } from "@/lib/utils";
import type { DashboardNotificationItem } from "./dashboard-notifications";

const TYPE_ICONS: Record<string, typeof Bell> = {
  application: ClipboardList,
  program: BookOpen,
  service: Clock,
  certificate: Award,
  info: Bell,
};

const TYPE_LABELS: Record<string, string> = {
  application: "Application",
  program: "Program",
  service: "Service Record",
  certificate: "Certificate",
  info: "General",
};

export function NotificationsList({ initialNotifications }: { initialNotifications: DashboardNotificationItem[] }) {
  const [items, setItems] = useState<DashboardNotificationItem[]>(initialNotifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [isProcessing, setIsProcessing] = useState(false);

  const unreadCount = items.filter((n) => !n.read).length;

  const filtered = items.filter((n) => {
    if (filter === "unread") return !n.read;
    return true;
  });

  const handleMarkRead = async (id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await markNotificationRead(id);
  };

  const handleMarkAllRead = async () => {
    setIsProcessing(true);
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    await markAllNotificationsRead();
    setIsProcessing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-600">Inbox</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-forest-950">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}` : "You're all caught up."}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Filter Pills */}
          <div className="flex items-center rounded-lg border bg-white p-1 shadow-xs">
            <button
              onClick={() => setFilter("all")}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-semibold transition-colors",
                filter === "all"
                  ? "bg-forest-900 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              All ({items.length})
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-semibold transition-colors",
                filter === "unread"
                  ? "bg-forest-900 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {unreadCount > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isProcessing}
              onClick={handleMarkAllRead}
              className="border-forest-300 text-forest-900 hover:bg-forest-50 font-semibold text-xs"
            >
              <CheckCheck className="h-4 w-4 mr-1.5" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-white py-16 text-center shadow-xs">
          <Bell className="mx-auto h-10 w-10 text-muted-foreground/50" aria-hidden="true" />
          <h3 className="mt-3 font-display text-base font-bold text-forest-950">
            {filter === "unread" ? "No unread notifications" : "No notifications yet"}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {filter === "unread"
              ? "All your notifications have been marked as read."
              : "Updates regarding your applications, service hours, and activities will appear here."}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((n) => {
            const Icon = TYPE_ICONS[n.type] ?? Bell;
            const typeLabel = TYPE_LABELS[n.type] ?? "Notice";

            return (
              <li
                key={n.id}
                className={cn(
                  "flex flex-col sm:flex-row sm:items-start justify-between gap-4 rounded-xl border p-5 shadow-sm transition-all",
                  n.read
                    ? "border-gray-100 bg-white"
                    : "border-gold-300 bg-gold-50/70"
                )}
              >
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <span
                    className={cn(
                      "mt-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors",
                      n.read
                        ? "bg-gray-100 text-muted-foreground"
                        : "bg-gold-200 text-forest-950 font-bold shadow-xs"
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-forest-100/70 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-forest-900">
                        {typeLabel}
                      </span>
                      {!n.read && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gold-400 px-2 py-0.5 text-[11px] font-bold text-forest-950">
                          New
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(n.created_at).toLocaleString("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>

                    <h3 className={cn("mt-1 text-base", n.read ? "font-semibold text-foreground" : "font-bold text-forest-950")}>
                      {n.title}
                    </h3>

                    {n.message && (
                      <p className="mt-1 text-sm text-forest-900/80 leading-relaxed whitespace-pre-line">
                        {n.message}
                      </p>
                    )}
                  </div>
                </div>

                {!n.read && (
                  <div className="sm:self-center shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkRead(n.id)}
                      className="border-gold-400/80 bg-white text-forest-900 hover:bg-gold-100/60 text-xs font-semibold"
                    >
                      <Check className="h-3.5 w-3.5 mr-1" />
                      Mark read
                    </Button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
