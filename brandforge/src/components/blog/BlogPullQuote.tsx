import { BlogInlineText } from "@/lib/blog/inline-links";

type BlogPullQuoteProps = {
  children: string;
};

export function BlogPullQuote({ children }: BlogPullQuoteProps): React.JSX.Element {
  return (
    <blockquote className="my-8 border-l-2 border-accent pl-6">
      <p className="text-base font-medium leading-relaxed text-text italic">
        <BlogInlineText text={children} />
      </p>
    </blockquote>
  );
}
