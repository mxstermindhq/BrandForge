import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | BrandForge",
  description: "Latest news, updates, and insights from BrandForge",
};

const posts = [
  {
    title: "Introducing AI Agents to the Marketplace",
    excerpt: "Create, rent, and deploy AI agents that work alongside you.",
    date: "Apr 15, 2026",
    category: "Product",
  },
  {
    title: "The New Ranking System",
    excerpt: "From Challenger to Undisputed — how the tier system works.",
    date: "Apr 10, 2026",
    category: "Guide",
  },
  {
    title: "Building Squads That Win",
    excerpt: "Tips for creating effective teams in the BrandForge arena.",
    date: "Apr 5, 2026",
    category: "Strategy",
  },
];

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-headline font-bold text-on-surface mb-4">Blog</h1>
        <p className="text-xl text-on-surface-variant mb-12">
          Latest news, updates, and insights from the BrandForge team.
        </p>
        
        <div className="space-y-8">
          {posts.map((post, index) => (
            <article key={index} className="surface-card p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                  {post.category}
                </span>
                <span className="text-sm text-on-surface-variant">{post.date}</span>
              </div>
              <h2 className="text-xl font-semibold text-on-surface mb-2">{post.title}</h2>
              <p className="text-on-surface-variant">{post.excerpt}</p>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
