import { CopyButton } from "@/components/content/CopyButton";
import { BlogInlineText } from "@/lib/blog/inline-links";

type BlogStatCalloutProps = {
  stat: string;
  copyLabel?: string;
  context?: string;
};

export function BlogStatCallout({ stat, copyLabel, context }: BlogStatCalloutProps): React.JSX.Element {
  return (
    <div className="my-6 rounded-md border border-b1 bg-s1 p-5">
      <p className="font-mono text-lg font-bold text-accent-bright">
        <BlogInlineText text={stat} />
      </p>
      {context ? (
        <p className="mt-2 text-sm text-text-secondary">
          <BlogInlineText text={context} />
        </p>
      ) : null}
      {copyLabel ? (
        <div className="mt-3">
          <CopyButton text={stat.replace(/\*\*/g, "")} label={copyLabel} />
        </div>
      ) : null}
    </div>
  );
}
