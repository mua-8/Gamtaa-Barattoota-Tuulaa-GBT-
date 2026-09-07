import type { MetadataRoute } from "next";
import { PROGRAMS } from "@/lib/data/programs";
import { SITE_URL } from "@/lib/site";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: {
    route: string;
    priority: number;
    changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  }[] = [
    { route: "", priority: 1.0, changeFrequency: "weekly" },
    { route: "/about", priority: 0.9, changeFrequency: "monthly" },
    { route: "/programs", priority: 0.9, changeFrequency: "weekly" },
    { route: "/announcements", priority: 0.85, changeFrequency: "daily" },
    { route: "/impact", priority: 0.8, changeFrequency: "monthly" },
    { route: "/gallery", priority: 0.8, changeFrequency: "weekly" },
    { route: "/team", priority: 0.8, changeFrequency: "monthly" },
    { route: "/contact", priority: 0.8, changeFrequency: "monthly" },
    { route: "/join", priority: 0.8, changeFrequency: "monthly" },
    { route: "/join-team", priority: 0.75, changeFrequency: "monthly" },
  ];

  const slugs = new Set(PROGRAMS.map((p) => p.slug));

  try {
    const supabase = await getSupabaseServerClient();
    if (supabase) {
      const { data } = await supabase
        .from("programs")
        .select("slug, updated_at")
        .neq("status", "draft");

      if (data) {
        data.forEach((p) => {
          if (p.slug) slugs.add(p.slug);
        });
      }
    }
  } catch {
    // Fallback to static programs list
  }

  const programEntries: MetadataRoute.Sitemap = Array.from(slugs).map((slug) => ({
    url: `${SITE_URL}/programs/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.75,
  }));

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map(
    ({ route, priority, changeFrequency }) => ({
      url: `${SITE_URL}${route}`,
      lastModified: now,
      changeFrequency,
      priority,
    })
  );

  return [...staticEntries, ...programEntries];
}
