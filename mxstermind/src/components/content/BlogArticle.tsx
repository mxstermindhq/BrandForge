import { FAQBlock } from "@/components/content/FAQBlock";
import type { BlogPost } from "@/content/blog/index";

type BlogArticleProps = {
  post: BlogPost;
};

export function BlogArticle({ post }: BlogArticleProps): React.JSX.Element {
  return (
    <article className="py-8">
      <p className="content-wrap font-mono text-[9px] uppercase tracking-wider text-muted">
        Published by mxstermind · {post.datePublished} · {post.readingTime}
      </p>
      {post.sections.map((section) => (
        <section key={section.heading} className="content-wrap py-10">
          <h2 className="font-serif text-2xl font-light text-text">{section.heading}</h2>
          <div className="mt-4 space-y-4">
            {section.paragraphs.map((p) => (
              <p key={p.slice(0, 48)} className="text-sm leading-relaxed text-text-secondary">
                {p}
              </p>
            ))}
          </div>
        </section>
      ))}
      <FAQBlock items={post.faqs} />
    </article>
  );
}
