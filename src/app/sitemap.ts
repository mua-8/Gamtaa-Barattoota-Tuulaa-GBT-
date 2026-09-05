import type { MetadataRoute } from "next";
import { PROGRAMS } from "@/lib/data/programs";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/about",
    "/programs",
    "/impact",
    "/gallery",
    "/team",
    "/contact",
    "/join",
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: `https://gbtuulaa.org${route}`,
      lastModified: new Date("2026-08-26"),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.8,
    })),
    ...PROGRAMS.map((program) => ({
      url: `https://gbtuulaa.org/programs/${program.slug}`,
      lastModified: new Date("2026-08-26"),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
