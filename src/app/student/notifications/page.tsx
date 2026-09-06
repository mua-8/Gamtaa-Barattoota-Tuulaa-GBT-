import type { Metadata } from "next";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { NotificationsList } from "@/components/student/notifications-list";

export const metadata: Metadata = {
  title: "Notifications",
  description: "Your GBT notifications: application decisions, enrollments, verifications, certificates.",
  robots: { index: false },
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

  return <NotificationsList initialNotifications={items} />;
}
