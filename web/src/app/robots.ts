import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/marketplace", "/leaderboard", "/plans", "/p/"],
        disallow: [
          "/chat",
          "/settings",
          "/studio",
          "/ai/",
          "/services",
          "/services/new",
          "/requests",
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
