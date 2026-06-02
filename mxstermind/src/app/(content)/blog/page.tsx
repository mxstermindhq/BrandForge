import type { Metadata } from "next";
import Link from "next/link";
import { CTASection, FAQBlock, PageHero, PageShell } from "@/components/content";
import { BLOG_HUB_CARDS, BLOG_HUB_FAQ } from "@/content/blog/index";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Blog — Editorial | mxstermind",
  description:
    "Architecture notes, bespoke vs package guidance, Web3 branding, and ethics — published by mxstermind.",
  path: "/blog/",
});

export default function BlogHubPage(): React.JSX.Element {
  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Blog", href: "/blog/" },
      ]}
      path="/blog/"
      faqs={BLOG_HUB_FAQ}
    >
      <PageHero
        eyebrow="Editorial"
        title="Notes from shipped work"
        subhead="Long-form guidance for established buyers scoping bespoke design, engineering, and growth."
      />
      <section className="py-12">
        <div className="content-wrap divide-y divide-b1 border-y border-b1">
          {BLOG_HUB_CARDS.map((post) => (
            <article key={post.slug} className="py-8">
              <p className="font-mono text-[9px] uppercase tracking-wider text-muted">
                {post.date} · {post.readingTime}
              </p>
              <h2 className="mt-2 font-serif text-2xl font-light">
                <Link href={post.href} className="hover:text-accent-bright">
                  {post.title}
                </Link>
              </h2>
              <p className="mt-3 max-w-2xl text-sm text-text-secondary">{post.excerpt}</p>
              <Link href={post.href} className="mt-4 inline-block font-mono text-[10px] text-accent-bright hover:text-text">
                Read article →
              </Link>
            </article>
          ))}
        </div>
      </section>
      <FAQBlock items={BLOG_HUB_FAQ} />
      <CTASection title="Apply what you read" subhead="Reference the article in your Discord application." />
    </PageShell>
  );
}
