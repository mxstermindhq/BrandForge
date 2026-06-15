import { FAQBlock, InlineCTA } from "@/components/content";
import { BlogPullQuote } from "@/components/blog/BlogPullQuote";
import { BlogSolutionBox } from "@/components/blog/BlogSolutionBox";
import { BlogStatCallout } from "@/components/blog/BlogStatCallout";
import { CodeBlock } from "@/components/blog/CodeBlock";
import { BlogPostFooter } from "@/components/blog/BlogPostFooter";
import { OptimizedPicture } from "@/components/visual/OptimizedPicture";
import type { BlogPost } from "@/content/blog/index";
import { BlogInlineText } from "@/lib/blog/inline-links";

type BlogArticleProps = {
  post: BlogPost;
};

function renderBlock(block: NonNullable<BlogPost["sections"][number]["blocks"]>[number], key: string): React.JSX.Element {
  switch (block.type) {
    case "p":
      return (
        <p key={key} className="text-sm leading-relaxed text-text-secondary">
          <BlogInlineText text={block.text} />
        </p>
      );
    case "quote":
      return <BlogPullQuote key={key}>{block.text}</BlogPullQuote>;
    case "solution":
      return <BlogSolutionBox key={key} title={block.title} paragraphs={block.paragraphs} />;
    case "stat":
      return (
        <BlogStatCallout
          key={key}
          stat={block.stat}
          copyLabel={block.copyLabel}
          context={block.context}
        />
      );
    case "statsBox":
      return (
        <div
          key={key}
          className="my-6 grid gap-4 rounded-md border border-b1 bg-s1 p-6 sm:grid-cols-3"
        >
          {block.items.map((item) => (
            <div key={item.label}>
              <p className="font-mono text-2xl font-bold text-accent-bright">{item.value}</p>
              <p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-muted">{item.label}</p>
            </div>
          ))}
        </div>
      );
    default:
      return <span key={key} />;
  }
}

export function BlogArticle({ post }: BlogArticleProps): React.JSX.Element {
  const author = post.author ?? "BrandForge";

  return (
    <article className="py-8">
      {post.heroImage ? (
        <div className="content-wrap mb-8">
          <OptimizedPicture
            webpSrc={
              post.heroImage.endsWith(".webp")
                ? post.heroImage
                : post.heroImage.replace(/\.(png|jpg|avif)$/, ".webp")
            }
            avifSrc={
              post.heroImage.endsWith(".avif")
                ? post.heroImage
                : post.heroImage.replace(/\.(png|jpg|webp)$/, ".avif")
            }
            fallbackSrc={post.heroImage.replace(/\.(webp|avif)$/, ".png")}
            alt=""
            className="w-full rounded-md border border-b1"
            loading="eager"
            fetchPriority="high"
            width={1200}
            height={630}
            sizes="(max-width: 768px) 100vw, 720px"
          />
        </div>
      ) : null}

      <p className="content-wrap font-mono text-[9px] uppercase tracking-wider text-muted">
        {author} · {post.datePublished} · {post.readingTime}
        {post.category ? ` · ${post.category}` : ""}
        {post.series ? ` · ${post.series}` : ""}
      </p>

      {post.pullQuote ? (
        <div className="content-wrap mt-8">
          <BlogPullQuote>{post.pullQuote}</BlogPullQuote>
        </div>
      ) : null}

      {post.sections.map((section, index) => (
        <section key={section.heading} className="content-wrap py-10">
          <h2 className="text-xl font-bold text-text">{section.heading}</h2>
          <div className="mt-4 space-y-4">
            {section.blocks
              ? section.blocks.map((block, bi) => renderBlock(block, `${section.heading}-${bi}`))
              : section.paragraphs?.map((p) => (
                  <p key={p.slice(0, 48)} className="text-sm leading-relaxed text-text-secondary">
                    <BlogInlineText text={p} />
                  </p>
                ))}
            {section.codeSnippets?.map((snippet) => (
              <CodeBlock
                key={snippet.code.slice(0, 32)}
                code={snippet.code}
                language={snippet.language}
                showLineNumbers={snippet.showLineNumbers}
              />
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
      <FAQBlock items={post.faqs} pageSlug={`/blog/${post.slug}/`} />
    </article>
  );
}
