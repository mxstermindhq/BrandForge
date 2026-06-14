import Link from "next/link";
import { BlogCard } from "@/components/content/BlogCard";
import type { BlogCardData } from "@/types/content";

export const BLOG_CATEGORIES = ["All", "Discord", "Web3", "Forums", "Guides", "SEO", "Automation"] as const;

type BlogHubGridProps = {
  posts: readonly BlogCardData[];
  activeCategory?: string;
};

function filterByCategory(posts: readonly BlogCardData[], category: string): BlogCardData[] {
  const sorted = [...posts].sort((a, b) => b.date.localeCompare(a.date));
  if (category === "All") return sorted;
  return sorted.filter((post) => post.category === category);
}

/** Server-rendered blog hub — static category links, zero client JS. */
export function BlogHubGrid({ posts, activeCategory = "All" }: BlogHubGridProps): React.JSX.Element {
  const category = BLOG_CATEGORIES.includes(activeCategory as (typeof BLOG_CATEGORIES)[number])
    ? activeCategory
    : "All";
  const latest = [...posts].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
  const filtered = filterByCategory(posts, category);
  const showLatest = category === "All";

  return (
    <div>
      {showLatest ? (
        <section className="border-b border-b1 bg-s1 py-10">
          <div className="content-wrap">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-bright">Latest</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {latest.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <nav
        className="content-wrap flex flex-wrap gap-2 py-8"
        aria-label="Filter by category"
      >
        {BLOG_CATEGORIES.map((cat) => {
          const href = cat === "All" ? "/blog/" : `/blog/category/${cat.toLowerCase()}/`;
          const active = category === cat;

          return (
            <Link
              key={cat}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`rounded-full border px-3 py-1.5 font-mono text-[9px] font-semibold uppercase tracking-wider ${
                active
                  ? "border-accent bg-accent text-white"
                  : "border-b2 text-muted hover:border-accent"
              }`}
            >
              {cat}
            </Link>
          );
        })}
      </nav>

      <section className="pb-16">
        <div className="content-wrap">
          <p className="mb-6 font-mono text-[10px] text-muted">
            {filtered.length} post{filtered.length === 1 ? "" : "s"}
            {category !== "All" ? ` · ${category}` : ""}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
