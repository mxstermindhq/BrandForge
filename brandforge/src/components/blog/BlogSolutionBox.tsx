import { BlogInlineText } from "@/lib/blog/inline-links";

type BlogSolutionBoxProps = {
  title: string;
  paragraphs: readonly string[];
};

export function BlogSolutionBox({ title, paragraphs }: BlogSolutionBoxProps): React.JSX.Element {
  return (
    <aside className="my-6 rounded-md border border-accent/30 bg-accent/5 p-6">
      <h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent-bright">{title}</h3>
      <div className="mt-3 space-y-3">
        {paragraphs.map((p) => (
          <p key={p.slice(0, 40)} className="text-sm leading-relaxed text-text-secondary">
            <BlogInlineText text={p} />
          </p>
        ))}
      </div>
    </aside>
  );
}
