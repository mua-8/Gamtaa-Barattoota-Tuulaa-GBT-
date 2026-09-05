import type { Metadata } from "next";
import { GalleryBrowser } from "@/components/site/gallery-browser";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Photos from GBT education sessions, community service, trainings, events, youth activities, and tolerance programs.",
  alternates: { canonical: "/gallery" },
};

export default async function GalleryPage() {
  const supabase = await getSupabaseServerClient();
  const { data: galleryItems } = await supabase?.from("gallery_items").select("*").eq("is_published", true).order("display_order", { ascending: true }) || { data: [] };

  const formattedItems = (galleryItems || []).map(item => ({
    id: item.id,
    src: item.image_url,
    alt: item.title || "Gallery image",
    caption: item.title || item.description || "Gallery image",
    category: item.category || "General",
    date: new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }),
    location: "Tuulaa", 
  }));

  const categories = Array.from(new Set(formattedItems.map(item => item.category)));

  return <GalleryBrowser initialItems={formattedItems} categories={categories} />;
}
