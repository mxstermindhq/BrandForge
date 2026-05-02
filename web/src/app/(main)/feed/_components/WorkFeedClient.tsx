"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { apiGetJson } from "@/lib/api";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { safeImageSrc } from "@/lib/image-url";
import { useAuth } from "@/providers/AuthProvider";

// Feed item types
export type FeedItemType =
  | "DEAL_CLOSED"
  | "BRIEF_POSTED"
  | "LEVEL_UP"
  | "OPEN_FOR_WORK"
  | "COLLAB_WANTED"
  | "PORTFOLIO_POST";

interface FeedItem {
  id: string;
  type: FeedItemType;
  actor: {
    id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
    tier?: string;
  };
  payload: {
    // DEAL_CLOSED
    service_title?: string;
    rating?: number;
    deal_value?: number;
    // BRIEF_POSTED
    brief_title?: string;
    brief_budget_min?: number;
    brief_budget_max?: number;
    brief_category?: string;
    // LEVEL_UP
    new_tier?: string;
    // OPEN_FOR_WORK
    available_from?: string;
    skills?: string[];
    // COLLAB_WANTED
    role_needed?: string;
    project_type?: string;
    // PORTFOLIO_POST
    portfolio_title?: string;
    portfolio_thumbnail?: string;
    portfolio_category?: string;
  };
  created_at: string;
  engagement?: {
    likes_count: number;
    comments_count: number;
    has_liked: boolean;
  };
}

// Feed filter type
export type FeedFilter = "all" | "briefs" | "wins" | "available" | "collabs" | "network";

// Composer post type
export type PostType = "update" | "available" | "collab" | "portfolio";

async function getAccessToken(): Promise<string | null> {
  const supabase = getSupabaseBrowser();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getTierBadge(tier?: string): { emoji: string; color: string } {
  switch (tier?.toLowerCase()) {
    case "elite":
      return { emoji: "👑", color: "#FFD700" };
    case "pro":
      return { emoji: "⭐", color: "#C0C0C0" };
    case "expert":
      return { emoji: "🎯", color: "#CD7F32" };
    default:
      return { emoji: "🔷", color: "#64748b" };
  }
}

// Feed item card component
function FeedItemCard({ item, onLike }: { item: FeedItem; onLike?: (id: string) => void }) {
  const tierBadge = getTierBadge(item.actor.tier);
  const av = safeImageSrc(item.actor.avatar_url);

  const renderContent = () => {
    switch (item.type) {
      case "DEAL_CLOSED":
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎉</span>
              <span className="font-semibold text-on-surface">Closed a deal</span>
            </div>
            <p className="text-on-surface-variant">
              Completed: <span className="font-medium text-on-surface">{item.payload.service_title}</span>
            </p>
            {item.payload.rating && (
              <div className="flex items-center gap-1">
                <span className="text-amber-400">{"★".repeat(Math.floor(item.payload.rating))}</span>
                <span className="text-sm text-on-surface-variant">{item.payload.rating.toFixed(1)} rating</span>
              </div>
            )}
          </div>
        );

      case "BRIEF_POSTED":
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📋</span>
              <span className="font-semibold text-on-surface">Posted a new brief</span>
            </div>
            <p className="font-medium text-on-surface">{item.payload.brief_title}</p>
            <div className="flex flex-wrap gap-2 text-sm text-on-surface-variant">
              {item.payload.brief_category && (
                <span className="rounded-full bg-surface-container-high px-2 py-1">{item.payload.brief_category}</span>
              )}
              {(item.payload.brief_budget_min || item.payload.brief_budget_max) && (
                <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-emerald-600 dark:text-emerald-400">
                  ${item.payload.brief_budget_min?.toLocaleString() || "0"} - ${item.payload.brief_budget_max?.toLocaleString() || "∞"}
                </span>
              )}
            </div>
            <Link
              href={`/requests/${item.id}`}
              className="inline-block rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20"
            >
              Submit Proposal →
            </Link>
          </div>
        );

      case "LEVEL_UP":
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏅</span>
              <span className="font-semibold text-on-surface">Level Up!</span>
            </div>
            <p className="text-on-surface-variant">
              Reached <span className="font-semibold" style={{ color: tierBadge.color }}>{item.payload.new_tier}</span> tier
            </p>
          </div>
        );

      case "OPEN_FOR_WORK":
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl text-green-500">🟢</span>
              <span className="font-semibold text-on-surface">Open for work</span>
            </div>
            {item.payload.available_from && (
              <p className="text-sm text-on-surface-variant">
                Available from {new Date(item.payload.available_from).toLocaleDateString()}
              </p>
            )}
            {item.payload.skills && item.payload.skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {item.payload.skills.map((skill) => (
                  <span key={skill} className="rounded-full bg-sky-500/10 px-2 py-1 text-xs text-sky-600 dark:text-sky-400">
                    {skill}
                  </span>
                ))}
              </div>
            )}
            <Link
              href={`/u/${encodeURIComponent(item.actor.username)}`}
              className="inline-block rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20"
            >
              Send Offer →
            </Link>
          </div>
        );

      case "COLLAB_WANTED":
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🤝</span>
              <span className="font-semibold text-on-surface">Looking for a collaborator</span>
            </div>
            <p className="text-on-surface-variant">
              Need a <span className="font-medium text-on-surface">{item.payload.role_needed}</span> for a{" "}
              <span className="font-medium text-on-surface">{item.payload.project_type}</span> project
            </p>
            <button className="inline-block rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20">
              Join Squad →
            </button>
          </div>
        );

      case "PORTFOLIO_POST":
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎨</span>
              <span className="font-semibold text-on-surface">New portfolio drop</span>
            </div>
            <p className="font-medium text-on-surface">{item.payload.portfolio_title}</p>
            {item.payload.portfolio_thumbnail && (
              <div className="relative h-48 w-full overflow-hidden rounded-lg">
                <Image
                  src={item.payload.portfolio_thumbnail}
                  alt={item.payload.portfolio_title || "Portfolio work"}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            {item.payload.portfolio_category && (
              <span className="rounded-full bg-surface-container-high px-2 py-1 text-xs text-on-surface-variant">
                {item.payload.portfolio_category}
              </span>
            )}
            <Link
              href={`/u/${encodeURIComponent(item.actor.username)}`}
              className="inline-block rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20"
            >
              Hire for something like this →
            </Link>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <article className="rounded-xl border border-outline-variant bg-surface-container p-4 transition hover:border-outline">
      {/* Header */}
      <div className="mb-3 flex items-start gap-3">
        <Link href={`/u/${encodeURIComponent(item.actor.username)}`} className="shrink-0">
          <div className="relative h-10 w-10 overflow-hidden rounded-full">
            {av ? (
              <Image src={av} alt={item.actor.full_name} fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                {item.actor.full_name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1">
            <Link
              href={`/u/${encodeURIComponent(item.actor.username)}`}
              className="font-semibold text-on-surface hover:underline"
            >
              {item.actor.full_name}
            </Link>
            <span style={{ color: tierBadge.color }} title={`${item.actor.tier || "Specialist"} Tier`}>
              {tierBadge.emoji}
            </span>
          </div>
          <p className="text-xs text-on-surface-variant">@{item.actor.username} · {formatTimeAgo(item.created_at)}</p>
        </div>
      </div>

      {/* Content */}
      <div className="mb-3">{renderContent()}</div>

      {/* Actions */}
      <div className="flex items-center gap-4 border-t border-outline-variant/50 pt-3">
        <button
          onClick={() => onLike?.(item.id)}
          className={`flex items-center gap-1 text-sm transition ${
            item.engagement?.has_liked ? "text-rose-500" : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <span>{item.engagement?.has_liked ? "❤️" : "🤍"}</span>
          <span>{item.engagement?.likes_count || 0}</span>
        </button>
        <button className="flex items-center gap-1 text-sm text-on-surface-variant hover:text-on-surface">
          <span>💬</span>
          <span>{item.engagement?.comments_count || 0}</span>
        </button>
        <button className="ml-auto text-sm text-on-surface-variant hover:text-on-surface">
          <span>↗️ Share</span>
        </button>
      </div>
    </article>
  );
}

// Composer component
function PostComposer({ onPost }: { onPost?: (content: string, type: PostType) => void }) {
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState<PostType>("update");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onPost?.(content, postType);
    setContent("");
    setIsExpanded(false);
  };

  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container p-4">
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          placeholder="Share an update, post availability, or look for a collaborator..."
          className="w-full resize-none rounded-lg bg-surface-container-high p-3 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/50"
          rows={isExpanded ? 4 : 2}
        />
        {isExpanded && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {[
                { id: "update", label: "Update", icon: "📝" },
                { id: "available", label: "Available", icon: "🟢" },
                { id: "collab", label: "Collab", icon: "🤝" },
                { id: "portfolio", label: "Portfolio", icon: "🎨" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setPostType(t.id as PostType)}
                  className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition ${
                    postType === t.id
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
                  }`}
                >
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="rounded-lg px-3 py-2 text-sm text-on-surface-variant hover:bg-surface-container-high"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!content.trim()}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition hover:bg-primary/90 disabled:opacity-50"
              >
                Post
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

// Main feed component
export function WorkFeedClient() {
  const { session } = useAuth();
  const [filter, setFilter] = useState<FeedFilter>("all");
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const fetchFeed = useCallback(
    async (pageNum: number, append = false) => {
      try {
        const token = await getAccessToken();
        const data = await apiGetJson<{
          items: FeedItem[];
          hasMore: boolean;
        }>(`/api/feed?filter=${filter}&page=${pageNum}&limit=20`, token);

        setItems((prev) => (append ? [...prev, ...data.items] : data.items));
        setHasMore(data.hasMore);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load feed");
      } finally {
        setLoading(false);
      }
    },
    [filter]
  );

  // Initial load
  useEffect(() => {
    setLoading(true);
    setPage(1);
    fetchFeed(1, false);
  }, [fetchFeed]);

  // Infinite scroll
  useEffect(() => {
    if (loadMoreRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !loading) {
            setPage((p) => p + 1);
            fetchFeed(page + 1, true);
          }
        },
        { threshold: 0.1 }
      );
      observerRef.current.observe(loadMoreRef.current);
    }
    return () => observerRef.current?.disconnect();
  }, [hasMore, loading, page, fetchFeed]);

  const handleLike = useCallback(async (itemId: string) => {
    try {
      const token = await getAccessToken();
      await fetch(`/api/feed/${itemId}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      // Optimistically update UI
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? {
                ...item,
                engagement: {
                  ...item.engagement!,
                  has_liked: !item.engagement?.has_liked,
                  likes_count: item.engagement?.has_liked
                    ? (item.engagement?.likes_count || 1) - 1
                    : (item.engagement?.likes_count || 0) + 1,
                },
              }
            : item
        )
      );
    } catch {
      // Silent fail - user can retry
    }
  }, []);

  const handlePost = useCallback(async (content: string, type: PostType) => {
    try {
      const token = await getAccessToken();
      await fetch("/api/feed/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content, type }),
      });
      // Refresh feed to show new post
      fetchFeed(1, false);
    } catch {
      // Silent fail - show error in UI
    }
  }, [fetchFeed]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-on-surface">Work Feed</h1>
        <p className="text-sm text-on-surface-variant">Professional activity from the BrandForge community</p>
      </header>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        {[
          { id: "all", label: "All" },
          { id: "briefs", label: "Briefs" },
          { id: "wins", label: "Wins" },
          { id: "available", label: "Available" },
          { id: "collabs", label: "Collabs" },
          ...(session ? [{ id: "network", label: "My Network" }] : []),
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as FeedFilter)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              filter === f.id
                ? "bg-primary text-on-primary"
                : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Composer (logged in only) */}
      {session && (
        <div className="mb-6">
          <PostComposer onPost={handlePost} />
        </div>
      )}

      {/* Feed items */}
      <div className="space-y-4">
        {loading && items.length === 0 ? (
          // Loading skeletons
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl border border-outline-variant bg-surface-container p-4">
              <div className="mb-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-surface-container-high" />
                <div className="space-y-2">
                  <div className="h-4 w-32 rounded bg-surface-container-high" />
                  <div className="h-3 w-24 rounded bg-surface-container-high" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full rounded bg-surface-container-high" />
                <div className="h-4 w-3/4 rounded bg-surface-container-high" />
              </div>
            </div>
          ))
        ) : error ? (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-6 text-center">
            <p className="text-rose-600 dark:text-rose-400">{error}</p>
            <button
              onClick={() => fetchFeed(1, false)}
              className="mt-3 rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600"
            >
              Try Again
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-outline-variant bg-surface-container p-8 text-center">
            <p className="text-lg font-medium text-on-surface">No activity yet</p>
            <p className="mt-2 text-sm text-on-surface-variant">
              {filter === "all"
                ? "Check back soon for updates from the community"
                : `No ${filter} posts found. Try a different filter.`}
            </p>
          </div>
        ) : (
          items.map((item) => <FeedItemCard key={item.id} item={item} onLike={handleLike} />)
        )}

        {/* Load more trigger */}
        <div ref={loadMoreRef} className="py-4 text-center">
          {hasMore && loading && (
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          )}
        </div>
      </div>
    </div>
  );
}
