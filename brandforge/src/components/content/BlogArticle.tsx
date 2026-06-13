import { FAQBlock, InlineCTA } from "@/components/content";
import { BlogPostFooter } from "@/components/blog/BlogPostFooter";
import type { BlogPost } from "@/content/blog/index";

type BlogArticleProps = {
  post: BlogPost;
};

export function BlogArticle({ post }: BlogArticleProps): React.JSX.Element {
  return (
    <article className="py-8">
      <p className="content-wrap font-mono text-[9px] uppercase tracking-wider text-muted">
        Published by BrandForge · {post.datePublished} · {post.readingTime}
        {post.series ? ` · ${post.series}` : ""}
      </p>
      {post.sections.map((section, index) => (
        <section key={section.heading} className="content-wrap py-10">
          <h2 className="text-xl font-bold text-text">{section.heading}</h2>
          <div className="mt-4 space-y-4">
            {section.paragraphs.map((p) => (
              <p key={p.slice(0, 48)} className="text-sm leading-relaxed text-text-secondary">
                {p}
              </p>
            ))}
          </div>
          {index === 2 ? (
            <InlineCTA
              headline="Want BrandForge on your project?"
              subhead="Quote in 24 hours on Discord or Telegram — mention this article."
            />
          ) : null}
        </section>
      ))}
      <BlogPostFooter post={post} />
      <FAQBlock items={post.faqs} />
    </article>
  );
}
