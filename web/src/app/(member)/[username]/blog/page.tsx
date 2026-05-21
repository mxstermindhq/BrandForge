import Link from "next/link";
import { notFound } from "next/navigation";
import { isReservedUsername, profilePath } from "@/lib/reserved-paths";

export default async function MemberBlogPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  if (isReservedUsername(username)) notFound();

  return (
    <main className="forge-page">
      <div className="forge-container forge-page-inner forge-page-inner-narrow text-center">
        <Link href={profilePath(username)} className="forge-back-link">
          ← {username}
        </Link>
        <h1 className="forge-section-title forge-page-title mt-8">Blog</h1>
        <p className="mt-3 text-[var(--forge-text-muted)]">Posts coming soon. Follow on Telegram for updates.</p>
      </div>
    </main>
  );
}
