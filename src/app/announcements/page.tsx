import type { Metadata } from "next";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/site/page-header";
import { AnnouncementsFeed } from "./announcements-feed";

export const metadata: Metadata = {
  title: "Announcements & News",
  description: "Stay informed about Gamtaa Barattoota Tuulaa activities, volunteer programs, deadlines, and community news.",
  alternates: { canonical: "/announcements" },
};

export default async function AnnouncementsPage() {
  const supabase = await getSupabaseServerClient();
  let items: any[] = [];

  if (supabase) {
    const { data } = await supabase
      .from("announcements")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false });
    if (data) items = data;
  }

  return (
    <>
      <PageHeader
        eyebrow="Updates & News"
        title="Announcements"
        description="Official notices, volunteer applications, upcoming community workshops, and highlights from Gamtaa Barattoota Tuulaa."
      />
      <section className="bg-cream/40 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnnouncementsFeed items={items} />
        </div>
      </section>
    </>
  );
}
