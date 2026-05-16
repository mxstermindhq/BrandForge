import Link from "next/link";
import { notFound } from "next/navigation";
import { isReservedUsername, profilePath } from "@/lib/reserved-paths";

export default async function MemberBlogPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  if (isReservedUsername(username)) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 text-center">
      <Link href={profilePath(username)} className="text-sm text-primary hover:underline">
        ← {username}
      </Link>
      <h1 className="font-headline mt-8 text-2xl font-bold">Blog</h1>
      <p className="mt-3 text-on-surface-variant">Posts coming soon. Follow on Telegram for updates.</p>
    </div>
  );
}
