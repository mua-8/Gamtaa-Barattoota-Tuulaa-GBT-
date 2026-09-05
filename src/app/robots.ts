import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/login", "/register", "/student/", "/admin/"],
      },
    ],
    sitemap: "https://gbtuulaa.org/sitemap.xml",
  };
}
