import Link from "next/link";
import type { BlogCardData } from "@/types/content";

type BlogCardProps = {
  post: BlogCardData;
};

export function BlogCard({ post }: BlogCardProps): React.JSX.Element {
  return (
    <article className="rounded-md border border-b1 bg-s1 p-6">
      <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">
        {post.date} · {post.readingTime}
      </p>
      <h3 className="mt-3 text-lg font-bold">
        <Link href={post.href} className="hover:text-accent-bright" data-cursor="hover">
          {post.title}
        </Link>
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-text-secondary">{post.excerpt}</p>
      <Link
        href={post.href}
        className="mt-4 inline-block font-mono text-[10px] text-accent-bright hover:text-text"
        data-cursor="hover"
      >
        Read article →
      </Link>
    </article>
  );
}
