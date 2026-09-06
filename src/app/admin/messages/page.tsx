import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { MessagesClient, ContactMessage } from "./messages-client";

export const metadata = {
  title: "Messages Inbox | GBT Admin",
  description: "Manage incoming contact messages and inquiries",
};

export default async function MessagesPage() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) redirect("/login");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Read messages using admin client to guarantee full access
  const admin = getSupabaseAdminClient() || supabase;
  const { data, error } = await admin
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading contact_messages:", error);
  }

  const messages: ContactMessage[] = (data || []).map((m: any) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    subject: m.subject,
    message: m.message,
    status: m.status || "new",
    created_at: m.created_at,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-forest-950">
          Messages Inbox
        </h1>
        <p className="mt-2 text-muted-foreground">
          View, organize, and reply to messages and applications submitted by visitors and students.
        </p>
      </div>

      <MessagesClient initialMessages={messages} />
    </div>
  );
}
