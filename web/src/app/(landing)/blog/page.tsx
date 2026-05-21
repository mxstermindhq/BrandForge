import type { Metadata } from "next";
import { ForgePage } from "@/components/forge/ForgePage";

export const metadata: Metadata = {
  title: "Blog",
  description: "News from the BrandForge forge",
};

const posts = [
  {
    title: "Welcome to the stellar forge",
    excerpt: "BrandForge.gg relaunches as the marketplace for everything digital.",
    date: "May 2026",
    category: "Launch",
  },
  {
    title: "AI systems & Discord growth",
    excerpt: "New categories: bots, automation packs, and community tooling.",
    date: "May 2026",
    category: "Product",
  },
  {
    title: "Talent in the furnace",
    excerpt: "Vetted operators for dev, design, and growth — one intro path.",
    date: "Apr 2026",
    category: "Talent",
  },
];

export default function BlogPage() {
  return (
    <ForgePage title="Forge log" eyebrow="Blog" description="Updates from the BrandForge team." narrow>
      <div className="space-y-4">
        {posts.map((post) => (
          <article key={post.title} className="forge-surface-card">
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <span className="forge-tag">{post.category}</span>
              <span className="text-xs text-[var(--forge-text-muted)]">{post.date}</span>
            </div>
            <h2 className="font-headline text-xl font-semibold text-[var(--forge-text)]">{post.title}</h2>
            <p className="mt-2 text-sm text-[var(--forge-text-muted)]">{post.excerpt}</p>
          </article>
        ))}
      </div>
    </ForgePage>
  );
}
