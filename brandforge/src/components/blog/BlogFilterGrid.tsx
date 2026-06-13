"use client";

import { useMemo, useState } from "react";
import { BlogCard } from "@/components/content/BlogCard";
import { BLOG_INDEX } from "@/content/blog/index";

const CATEGORIES = ["All", "Discord", "Web3", "Forums", "Guides", "SEO", "Automation"] as const;

export function BlogFilterGrid(): React.JSX.Element {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");

  const latest = useMemo(
    () => [...BLOG_INDEX].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4),
    [],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return BLOG_INDEX.filter((post) => {
      const catOk = category === "All" || post.category === category;
      const qOk =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.tags?.some((t) => t.toLowerCase().includes(q));
      return catOk && qOk;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [query, category]);

  return (
    <div>
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

      <div className="content-wrap flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <label className="sr-only" htmlFor="blog-search">
          Search blog posts
        </label>
        <input
          id="blog-search"
          type="search"
          placeholder="Search by title or tag…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full max-w-md rounded border border-b2 bg-s2 px-4 py-2.5 text-sm text-text placeholder:text-muted sm:flex-1"
        />
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by category">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={category === cat}
              onClick={() => setCategory(cat)}
              className={`rounded-full border px-3 py-1.5 font-mono text-[9px] font-semibold uppercase tracking-wider ${
                category === cat
                  ? "border-accent bg-accent text-white"
                  : "border-b2 text-muted hover:border-accent"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <section className="pb-16">
        <div className="content-wrap">
          <p className="mb-6 font-mono text-[10px] text-muted">
            {filtered.length} post{filtered.length === 1 ? "" : "s"}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
          {filtered.length === 0 ? (
            <p className="text-sm text-muted">No posts match — try another tag or clear search.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
