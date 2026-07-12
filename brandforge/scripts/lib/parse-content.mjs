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
  const portfolioTs = readContentFile(root, "portfolio/projects.ts");
  const indexTs = readContentFile(root, "index.ts");

  const portfolio = extractSlugs(portfolioTs, /slug:\s*"([^"]+)"/g).map((slug) => {
    const name = portfolioTs.match(new RegExp(`slug: "${slug}"[\\s\\S]*?name: "([^"]+)"`))?.[1] ?? slug;
    const description = portfolioTs.match(new RegExp(`slug: "${slug}"[\\s\\S]*?description:\\s*\\n\\s*"([^"]+)"`))?.[1] ?? "";
    return { slug, path: `/portfolio/${slug}/`, title: `${name} Case Study`, description };
  });

  const staticRoutes = parseStaticRoutes(indexTs);

  return {
    staticRoutes,
    blogPosts: [],
    portfolio,
    nichePages: [],
    servicePages: [],
    roadmap: [],
    total: staticRoutes.length + portfolio.length,
  };
}
