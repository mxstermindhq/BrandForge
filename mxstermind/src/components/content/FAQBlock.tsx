import type { FaqItem } from "@/types/content";

type FAQBlockProps = {
  title?: string;
  items: readonly FaqItem[];
  id?: string;
};

/** FAQ section optimised for AI extraction — questions phrased as users ask them. */
export function FAQBlock({
  title = "Questions operators ask",
  items,
  id = "faq",
}: FAQBlockProps): React.JSX.Element {
  return (
    <section id={id} className="py-[var(--spacing-section)]" aria-labelledby={`${id}-title`}>
      <div className="content-wrap">
        <h2
          id={`${id}-title`}
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-bright"
        >
          {title}
        </h2>
        <div className="mt-8 divide-y divide-b1 border-y border-b1">
          {items.map((item) => (
            <details key={item.question} className="group py-5">
              <summary className="cursor-pointer list-none text-base font-semibold text-text marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-start justify-between gap-4">
                  {item.question}
                  <span
                    className="font-mono text-accent-bright transition-transform group-open:rotate-45"
                    aria-hidden
                  >
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-text-secondary">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
