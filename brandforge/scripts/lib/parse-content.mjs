#!/usr/bin/env node
/**
 * Shared content manifest parser for build scripts (no TS import required).
 */
import fs from "node:fs";
import path from "node:path";

export function readContentFile(root, rel) {
  return fs.readFileSync(path.join(root, "src", "content", rel), "utf8");
}

export function extractSlugs(text, pattern) {
  return [...text.matchAll(pattern)].map((m) => m[1]);
}

export function parseStaticRoutes(indexTs) {
  const routes = [];
  const block = indexTs.match(/STATIC_CONTENT_ROUTES[^[]*\[([\s\S]*?)\]\s*as const/);
  if (!block) return routes;
  for (const m of block[1].matchAll(
    /path:\s*"([^"]+)"[\s\S]*?title:\s*"([^"]+)"[\s\S]*?description:\s*\n?\s*"([^"]+)"/g,
  )) {
    routes.push({ path: m[1], title: m[2], description: m[3] });
  }
  return routes;
}

export function buildManifest(root) {
  const blogTs = readContentFile(root, "blog/index.ts");
  const portfolioTs = readContentFile(root, "portfolio/projects.ts");
  const nicheTs = readContentFile(root, "niche/pages.ts");
  const servicesTs = readContentFile(root, "services/details.ts");
  const roadmapTs = readContentFile(root, "roadmap/stages.ts");
  const indexTs = readContentFile(root, "index.ts");

  const blogSlugs = extractSlugs(blogTs, /^\s+slug: "([^"]+)"/gm);

  const blogPosts = [];
  for (const slug of blogSlugs) {
    const keyMatch = blogTs.match(new RegExp(`"${slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}":\\s*\\{([\\s\\S]*?)\\n\\s*\\},`, "m"));
    const block = keyMatch?.[1] ?? "";
    const title = block.match(/metaTitle:\s*\n?\s*"([^"]+)"/)?.[1] ?? slug;
    const description = block.match(/metaDescription:\s*\n?\s*"([^"]+)"/)?.[1] ?? "";
    blogPosts.push({ slug, path: `/blog/${slug}/`, title, description });
  }

  // posts/*.ts glob files
  const postsDir = path.join(root, "src", "content", "blog", "posts");
  if (fs.existsSync(postsDir)) {
    for (const file of fs.readdirSync(postsDir).filter((f) => f.endsWith(".ts"))) {
      const text = fs.readFileSync(path.join(postsDir, file), "utf8");
      const slug = text.match(/slug:\s*"([^"]+)"/)?.[1];
      if (!slug || blogPosts.some((p) => p.slug === slug)) continue;
      blogPosts.push({
        slug,
        path: `/blog/${slug}/`,
        title: text.match(/metaTitle:\s*\n?\s*"([^"]+)"/)?.[1] ?? slug,
        description: text.match(/metaDescription:\s*\n?\s*"([^"]+)"/)?.[1] ?? "",
      });
    }
  }

  const bipFile = path.join(root, "src", "content", "blog", "building-brandforge-in-public-01.ts");
  if (fs.existsSync(bipFile) && !blogPosts.some((p) => p.slug === "building-brandforge-in-public-01")) {
    const bip = fs.readFileSync(bipFile, "utf8");
    blogPosts.push({
      slug: "building-brandforge-in-public-01",
      path: "/blog/building-brandforge-in-public-01/",
      title: bip.match(/metaTitle:\s*\n?\s*"([^"]+)"/)?.[1] ?? "Building BrandForge in public",
      description:
        bip.match(/metaDescription:\s*\n?\s*"([^"]+)"/)?.[1] ??
        "Week one of building BrandForge in public — packages, positioning, and shipping the marketing site.",
    });
  }

  const portfolio = extractSlugs(portfolioTs, /slug:\s*"([^"]+)"/g).map((slug) => {
    const name = portfolioTs.match(new RegExp(`slug: "${slug}"[\\s\\S]*?name: "([^"]+)"`))?.[1] ?? slug;
    const description = portfolioTs.match(new RegExp(`slug: "${slug}"[\\s\\S]*?description:\\s*\\n\\s*"([^"]+)"`))?.[1] ?? "";
    return { slug, path: `/portfolio/${slug}/`, title: `${name} Case Study`, description };
  });

  const niches = extractSlugs(nicheTs, /"([a-z0-9-]+)":\s*\{[\s\S]*?slug:/g).filter((s, i, a) => a.indexOf(s) === i);
  const nichePages = niches.map((slug) => {
    const block = nicheTs.match(new RegExp(`"${slug}":\\s*\\{([\\s\\S]*?)\\n\\s*\\},`))?.[1] ?? "";
    return {
      slug,
      path: `/for/${slug}/`,
      title: block.match(/title:\s*"([^"]+)"/)?.[1] ?? slug,
      description: block.match(/description:\s*\n?\s*"([^"]+)"/)?.[1] ?? "",
    };
  });

  const services = extractSlugs(servicesTs, /slug:\s*"([^"]+)"/g);
  const servicePages = services.map((slug) => {
    const block = servicesTs.match(new RegExp(`slug: "${slug}"[\\s\\S]*?meta:\\s*\\{([\\s\\S]*?)\\},`, "m"))?.[1] ?? "";
    return {
      slug,
      path: `/services/${slug}/`,
      title: block.match(/title:\s*\n?\s*"([^"]+)"/)?.[1] ?? slug,
      description: block.match(/description:\s*\n?\s*"([^"]+)"/)?.[1] ?? "",
    };
  });

  const roadmap = extractSlugs(roadmapTs, /slug:\s*"([^"]+)"/g).map((slug) => ({
    slug,
    path: `/roadmap/${slug}/`,
    title: slug,
    description: "",
  }));

  const staticRoutes = parseStaticRoutes(indexTs);

  return {
    staticRoutes,
    blogPosts,
    portfolio,
    nichePages,
    servicePages,
    roadmap,
    total:
      staticRoutes.length +
      blogPosts.length +
      portfolio.length +
      nichePages.length +
      servicePages.length +
      roadmap.length,
  };
}
