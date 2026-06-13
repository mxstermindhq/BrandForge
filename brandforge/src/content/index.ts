import { BLOG_INDEX, BLOG_POSTS, BLOG_SLUGS } from "./blog/index";
import { NICHE_PAGES, NICHE_SLUGS } from "./niche/pages";
import { PORTFOLIO_PROJECTS, PORTFOLIO_SLUGS } from "./portfolio/projects";
import { ROADMAP_STAGES, ROADMAP_SLUGS } from "./roadmap/stages";
import { SERVICE_DETAILS } from "./services/details";
import { SERVICE_SLUGS } from "./hubs/services-hub";
import { STORE_PRODUCTS } from "@/config/store";

export type ContentCategory =
  | "static"
  | "blog"
  | "portfolio"
  | "service"
  | "niche"
  | "roadmap";

export type ContentEntry = {
  slug: string;
  path: string;
  title: string;
  description: string;
  category: ContentCategory;
  lastModified: string;
  noindex?: boolean;
  tags?: readonly string[];
};

/** Static marketing routes — single source for sitemap + llms.txt */
export const STATIC_CONTENT_ROUTES: readonly ContentEntry[] = [
  {
    slug: "home",
    path: "/",
    title: "BrandForge — Design, Development & Growth",
    description: "Fixed USD packages for brand, web, and growth. Quote in 24 hours.",
    category: "static",
    lastModified: "2026-06-13",
  },
  {
    slug: "services",
    path: "/services/",
    title: "Services Hub | BrandForge",
    description: "Brand identity, web design, mobile apps, automation, SEO, and paid ads.",
    category: "static",
    lastModified: "2026-06-13",
  },
  {
    slug: "packages",
    path: "/packages/",
    title: "Packages & Pricing | BrandForge",
    description: "Five fixed USD tiers from Blueprint to Full-Stack retainer.",
    category: "static",
    lastModified: "2026-06-13",
  },
  {
    slug: "portfolio",
    path: "/portfolio/",
    title: "Portfolio | BrandForge",
    description: "Live, upcoming, and archived case studies with outcomes.",
    category: "static",
    lastModified: "2026-06-13",
  },
  {
    slug: "blog",
    path: "/blog/",
    title: "Blog | BrandForge",
    description: "Operator guides on GEO, Discord, forums, CRO, and automation.",
    category: "static",
    lastModified: "2026-06-13",
  },
  {
    slug: "for",
    path: "/for/",
    title: "Who We Serve | BrandForge",
    description: "Niche guides for gaming, Web3, SaaS, forums, e-commerce, and creators.",
    category: "static",
    lastModified: "2026-06-13",
  },
  {
    slug: "about",
    path: "/about/",
    title: "About BrandForge",
    description: "Development-first studio for operators who want one squad.",
    category: "static",
    lastModified: "2026-06-01",
  },
  {
    slug: "contact",
    path: "/contact/",
    title: "Contact | BrandForge",
    description: "Discord or Telegram — fixed quote in 24 hours.",
    category: "static",
    lastModified: "2026-06-01",
  },
  {
    slug: "partners",
    path: "/partners/",
    title: "Partners & Tools | BrandForge",
    description: "Recommended tools and partnership opportunities.",
    category: "static",
    lastModified: "2026-06-13",
  },
  {
    slug: "store",
    path: "/store/",
    title: "Template Store | BrandForge",
    description: "Premium templates and digital kits — $19–$49 with instant delivery.",
    category: "static",
    lastModified: "2026-06-13",
  },
  {
    slug: "mxstermind",
    path: "/mxstermind/",
    title: "MXSTERMIND Bridge | BrandForge",
    description: "BrandForge builds identity. MXSTERMIND scales economics. Ecosystem hub.",
    category: "static",
    lastModified: "2026-06-13",
  },
  {
    slug: "membership",
    path: "/membership/",
    title: "Membership | BrandForge",
    description: "Insider and Pro community tiers — Discord roles and early access.",
    category: "static",
    lastModified: "2026-06-13",
  },
  {
    slug: "events",
    path: "/events/",
    title: "Events & Workshops | BrandForge",
    description: "Monthly branding workshops and office hours on Discord.",
    category: "static",
    lastModified: "2026-06-13",
  },
  {
    slug: "community",
    path: "/community/",
    title: "Community Showcase | BrandForge",
    description: "Projects built with BrandForge — submit yours on Discord.",
    category: "static",
    lastModified: "2026-06-13",
  },
  {
    slug: "roadmap",
    path: "/roadmap/",
    title: "Roadmap | BrandForge",
    description: "Validate, brand, launch, grow, scale — operator playbook.",
    category: "static",
    lastModified: "2026-06-01",
  },
  {
    slug: "brand-guide",
    path: "/brand-guide/",
    title: "Brand Guide | BrandForge",
    description: "Design tokens, voice, and copy patterns.",
    category: "static",
    lastModified: "2026-06-01",
  },
  {
    slug: "ethics-standards",
    path: "/ethics-standards/",
    title: "Ethics & Standards | BrandForge",
    description: "How BrandForge works with clients and communities.",
    category: "static",
    lastModified: "2026-06-01",
  },
  {
    slug: "privacy",
    path: "/privacy/",
    title: "Privacy Policy | BrandForge",
    description: "BrandForge privacy policy.",
    category: "static",
    lastModified: "2026-01-01",
  },
  {
    slug: "terms",
    path: "/terms/",
    title: "Terms | BrandForge",
    description: "BrandForge terms of service.",
    category: "static",
    lastModified: "2026-01-01",
  },
] as const;

const NOINDEX_PATHS = new Set(["/launch/", "/client/", "/admin/"]);

function blogEntries(): ContentEntry[] {
  return BLOG_SLUGS.map((slug) => {
    const post = BLOG_POSTS[slug]!;
    return {
      slug,
      path: `/blog/${slug}/`,
      title: post.metaTitle,
      description: post.metaDescription,
      category: "blog" as const,
      lastModified: post.datePublished,
      tags: post.tags,
    };
  });
}

function portfolioEntries(): ContentEntry[] {
  return PORTFOLIO_PROJECTS.map((p) => ({
    slug: p.slug,
    path: `/portfolio/${p.slug}/`,
    title: `${p.name} Case Study | BrandForge`,
    description: p.description.slice(0, 160),
    category: "portfolio" as const,
    lastModified: "2026-06-13",
    tags: p.tags,
  }));
}

function serviceEntries(): ContentEntry[] {
  return SERVICE_DETAILS.map((svc) => ({
    slug: svc.slug,
    path: `/services/${svc.slug}/`,
    title: svc.meta.title,
    description: svc.meta.description,
    category: "service" as const,
    lastModified: "2026-06-01",
  }));
}

function nicheEntries(): ContentEntry[] {
  return NICHE_SLUGS.map((slug) => {
    const page = NICHE_PAGES[slug]!;
    return {
      slug,
      path: `/for/${slug}/`,
      title: page.meta.title,
      description: page.meta.description,
      category: "niche" as const,
      lastModified: "2026-06-13",
    };
  });
}

function roadmapEntries(): ContentEntry[] {
  return ROADMAP_SLUGS.map((slug) => {
    const stage = ROADMAP_STAGES[slug]!;
    return {
      slug,
      path: `/roadmap/${slug}/`,
      title: stage.meta.title,
      description: stage.meta.description,
      category: "roadmap" as const,
      lastModified: "2026-06-01",
    };
  });
}

function storeProductEntries(): ContentEntry[] {
  return STORE_PRODUCTS.map((p) => ({
    slug: p.slug,
    path: `/store/${p.slug}/`,
    title: `${p.name} | BrandForge Store`,
    description: p.tagline,
    category: "static" as const,
    lastModified: "2026-06-13",
    tags: [p.category, "store"],
  }));
}

/** All indexable content entries for sitemap, llms.txt, and lint. */
export function getAllContentEntries(): ContentEntry[] {
  return [
    ...STATIC_CONTENT_ROUTES,
    ...serviceEntries(),
    ...portfolioEntries(),
    ...roadmapEntries(),
    ...nicheEntries(),
    ...blogEntries(),
    ...storeProductEntries(),
  ].filter((e) => !NOINDEX_PATHS.has(e.path) && !e.noindex);
}

export const CONTENT_INDEX = getAllContentEntries();

export const CONTENT_STATS = {
  total: CONTENT_INDEX.length,
  blog: BLOG_SLUGS.length,
  portfolio: PORTFOLIO_SLUGS.length,
  niches: NICHE_SLUGS.length,
  services: SERVICE_SLUGS.length,
  roadmap: ROADMAP_SLUGS.length,
  static: STATIC_CONTENT_ROUTES.length,
} as const;

export {
  BLOG_INDEX,
  BLOG_POSTS,
  BLOG_SLUGS,
  NICHE_PAGES,
  NICHE_SLUGS,
  PORTFOLIO_PROJECTS,
  PORTFOLIO_SLUGS,
  ROADMAP_STAGES,
  ROADMAP_SLUGS,
  SERVICE_DETAILS,
  SERVICE_SLUGS,
};
