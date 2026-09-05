import type { Metadata } from "next";
import { Award, Bell, BookOpen, CheckCheck, ClipboardList, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/actions/student";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Notifications",
  description: "Your GBT notifications: application decisions, enrollments, verifications, certificates.",
  robots: { index: false },
};

const TYPE_ICONS: Record<string, typeof Bell> = {
  application: ClipboardList,
  program: BookOpen,
  service: Clock,
  certificate: Award,
  info: Bell,
};

export default async function NotificationsPage() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const items = notifications ?? [];
  const unread = items.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-600">Inbox</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-forest-950">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {unread > 0 ? `${unread} unread` : "You're all caught up."}
          </p>
        </div>
        {unread > 0 && (
          <form action={async () => { await markAllNotificationsRead(); }}>
            <Button type="submit" variant="outline" size="sm" className="border-forest-300 text-forest-900 hover:bg-forest-50">
              <CheckCheck className="h-4 w-4" aria-hidden="true" />
              Mark all read
            </Button>
          </form>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-white py-16 text-center">
          <Bell className="mx-auto h-9 w-9 text-muted-foreground" aria-hidden="true" />
          <p className="mt-3 text-sm text-muted-foreground">
            No notifications yet — they&apos;ll appear here as things happen.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((n) => {
            const Icon = TYPE_ICONS[n.type] ?? Bell;
            return (
              <li
                key={n.id}
                className={cn(
                  "flex items-start gap-4 rounded-xl border p-5 shadow-sm",
                  n.read ? "border-border bg-white" : "border-gold-300 bg-gold-50"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                    n.read ? "bg-muted text-muted-foreground" : "bg-gold-200 text-gold-800"
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-foreground">{n.title}</p>
                  {n.message && (
                    <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>
                  )}
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {new Date(n.created_at).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                {!n.read && (
                  <form action={async (fd) => { await markNotificationRead(fd); }}>
                    <input type="hidden" name="id" value={n.id} />
                    <Button type="submit" variant="ghost" size="sm" className="text-forest-800 hover:bg-forest-100">
                      Mark read
                    </Button>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
