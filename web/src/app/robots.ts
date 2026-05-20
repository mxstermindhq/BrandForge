import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/about", "/help", "/blog", "/press", "/login", "/privacy", "/terms", "/cookies", "/work/", "/offer/"],
        disallow: [
          "/api/",
          "/auth/",
          "/_next/",
          "/embed/",
          "/og/",
          "/*?*utm_",
          "/*?*ref=",
        ],
      },
    ],
    sitemap: "https://brandforge.gg/sitemap.xml",
    host: "https://brandforge.gg",
  };
}
