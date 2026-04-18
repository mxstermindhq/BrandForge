import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/services", "/requests", "/leaderboard", "/plans", "/p/"],
        disallow: [
          "/chat",
          "/settings",
          "/studio",
          "/ai/",
          "/services/new",
          "/requests/new",
          "/api/",
          "/welcome",
          "/auth",
          "/bid",
          "/payment",
          "/messages",
        ],
      },
    ],
    sitemap: "https://brandforge.gg/sitemap.xml",
  };
}
