import type { Metadata } from "next";
import { ActivityFeed } from "@/app/(landing)/_components/ActivityFeed";

export const metadata: Metadata = {
  title: "Feed",
  description: "Latest news and activity across the BrandForge platform.",
  openGraph: { url: "https://brandforge.gg/feed" },
};

export default function FeedPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-[0.12em] text-on-surface-variant">Feed</p>
        <h1 className="mt-1 text-3xl font-bold text-on-surface">Latest platform activity</h1>
        <p className="mt-2 max-w-2xl text-sm text-on-surface-variant">
          Marketplace updates, deal room momentum, and community news in one simple stream.
        </p>
      </header>

      <ActivityFeed />
    </div>
  );
}
