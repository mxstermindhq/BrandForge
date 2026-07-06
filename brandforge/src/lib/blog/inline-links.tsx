import Link from "next/link";
import type { ReactNode } from "react";

/** Human labels for bare internal paths in blog copy. */
const PATH_LABELS: Record<string, string> = {
  "/": "home",
  "/packages/": "packages",
  "/portfolio/": "portfolio",
  "/blog/": "blog",
  "/roadmap/": "roadmap",
  "/mxstermind/": "mxstermind Founder OS",
  "/contact/": "contact",
  "/ethics-standards/": "ethics standards",
  "/services/brand-identity/": "brand identity",
  "/services/web-design/": "web design",
  "/services/social-media/": "social media",
  "/services/discord-branding/": "Discord branding",
  "/services/seo-growth/": "SEO & growth",
  "/services/automation/": "automation",
  "/services/mobile-apps/": "mobile apps",
  "/services/paid-ads/": "paid ads",
  "/services/ai-tools/": "AI tools",

  "/roadmap/validate-your-idea/": "validate your idea",
  "/for/web3-crypto-projects/": "Web3 operators",
  "/for/saas-startups/": "SaaS startups",
  "/for/gaming-server-owners/": "gaming server owners",
  "/for/forum-sellers/": "forum sellers",
  "/for/ecommerce-brands/": "e-commerce brands",
  "/for/content-creators/": "content creators",
  "/for/mobile-app-founders/": "mobile app founders",
  "/for/automation-ops-teams/": "ops teams",
  "/process/": "our process",
};

const PLACEHOLDER_PATHS: Record<string, (slug: string) => string> = {
  service: (slug) => `/services/${slug}/`,
  portfolio: (slug) => `/portfolio/${slug}/`,
  niche: (slug) => `/for/${slug}/`,
  blog: (slug) => `/blog/${slug}/`,
};

const LINK_CLASS =
  "font-medium text-accent-bright underline decoration-accent/40 underline-offset-2 hover:text-text hover:decoration-accent";

const BARE_PATH_RE =
  /(?<![(\["'])(\/(?:services|for|blog|portfolio|packages|roadmap|mxstermind|contact|ethics-standards|store)(?:\/[a-z0-9-]+)*\/)/gi;

const MD_LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;
const PLACEHOLDER_RE = /\[\[(service|portfolio|niche|blog):([^\]]+)\]\]/g;

function labelForPath(href: string, override?: string): string {
  if (override) return override;
  const normalized = href.endsWith("/") ? href : `${href}/`;
  if (PATH_LABELS[normalized]) return PATH_LABELS[normalized]!;
  const parts = normalized.replace(/\/$/, "").split("/").filter(Boolean);
  const last = parts[parts.length - 1] ?? "page";
  return last.replace(/-/g, " ");
}

function InternalLink({ href, children }: { href: string; children: string }): React.JSX.Element {
  if (href.startsWith("http")) {
    return (
      <a href={href} className={LINK_CLASS} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={LINK_CLASS}>
      {children}
    </Link>
  );
}

function parseBarePaths(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  BARE_PATH_RE.lastIndex = 0;
  while ((match = BARE_PATH_RE.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const href = match[1]!;
    nodes.push(
      <InternalLink key={`${keyPrefix}-p-${match.index}`} href={href}>
        {labelForPath(href)}
      </InternalLink>,
    );
    last = match.index + href.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes.length ? nodes : [text];
}

function parsePlaceholders(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  PLACEHOLDER_RE.lastIndex = 0;
  while ((match = PLACEHOLDER_RE.exec(text)) !== null) {
    if (match.index > last) {
      nodes.push(...parseBarePaths(text.slice(last, match.index), `${keyPrefix}-pre-${match.index}`));
    }
    const kind = match[1] as keyof typeof PLACEHOLDER_PATHS;
    const slug = match[2]!;
    const href = PLACEHOLDER_PATHS[kind]?.(slug) ?? `/${slug}/`;
    nodes.push(
      <InternalLink key={`${keyPrefix}-ph-${match.index}`} href={href}>
        {labelForPath(href)}
      </InternalLink>,
    );
    last = match.index + match[0].length;
  }
  if (last < text.length) nodes.push(...parseBarePaths(text.slice(last), `${keyPrefix}-tail`));
  return nodes.length ? nodes : parseBarePaths(text, keyPrefix);
}

function parseBold(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]!;
    if (part.startsWith("**") && part.endsWith("**")) {
      nodes.push(
        <strong key={`${keyPrefix}-b-${i}`} className="font-semibold text-text">
          {part.slice(2, -2)}
        </strong>,
      );
    } else if (part) {
      nodes.push(...parsePlaceholders(part, `${keyPrefix}-${i}`));
    }
  }
  return nodes.length ? nodes : parsePlaceholders(text, keyPrefix);
}

/** Turn blog copy into linked text — supports [label](/path/), [[service:slug]], bare /paths/, and **bold**. */
export function BlogInlineText({ text }: { text: string }): React.JSX.Element {
  const nodes: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  MD_LINK_RE.lastIndex = 0;

  while ((match = MD_LINK_RE.exec(text)) !== null) {
    if (match.index > last) {
      nodes.push(...parseBold(text.slice(last, match.index), `md-pre-${match.index}`));
    }
    const label = match[1]!;
    const href = match[2]!;
    nodes.push(
      <InternalLink key={`md-${match.index}`} href={href}>
        {label}
      </InternalLink>,
    );
    last = match.index + match[0].length;
  }

  if (last < text.length) {
    nodes.push(...parseBold(text.slice(last), "md-tail"));
  }

  if (!nodes.length) {
    return <>{parseBold(text, "full")}</>;
  }

  return <>{nodes}</>;
}
