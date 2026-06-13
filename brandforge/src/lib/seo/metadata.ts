import type { Metadata } from "next";
import { SITE } from "@/config/site";
import type { PageSeoMeta } from "@/types/content";

/** Builds Next.js Metadata with canonical, OG, and robots for a marketing page. */
export function buildPageMetadata(meta: PageSeoMeta): Metadata {
  const canonical = `${SITE.url}${meta.path.startsWith("/") ? meta.path : `/${meta.path}`}`;
  const title = meta.title.length > 60 ? meta.title.slice(0, 57) + "…" : meta.title;
  const description =
    meta.description.length > 160 ? meta.description.slice(0, 157) + "…" : meta.description;

  return {
    title,
    description,
    keywords: meta.keywords ? [...meta.keywords] : undefined,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: "BrandForge",
      title: meta.ogTitle ?? title,
      description: meta.ogDescription ?? description,
      images: [
        {
          url: meta.ogImage ?? "/img/og-image.png",
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.ogTitle ?? title,
      description: meta.ogDescription ?? description,
      images: [meta.ogImage ?? "/img/og-image.png"],
    },
    robots: { index: true, follow: true },
  };
}
