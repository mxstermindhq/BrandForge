"use client";

import { useCallback, useState } from "react";
import type { FaqItem } from "@/types/content";

type FAQBlockProps = {
  title?: string;
  items: readonly FaqItem[];
  id?: string;
};

function FAQItemRow({ item }: { item: FaqItem }): React.JSX.Element {
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);

  const sendFeedback = useCallback((vote: "up" | "down"): void => {
    setFeedback(vote);
    if (typeof window !== "undefined") {
      const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
      gtag?.("event", "faq_feedback", {
        vote,
        question: item.question.slice(0, 120),
      });
    }
  }, [item.question]);

  return (
    <details className="group py-5">
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
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-text-secondary">{item.answer}</p>
      <div className="mt-3 flex items-center gap-2" role="group" aria-label="Was this answer helpful?">
        <span className="font-mono text-[9px] uppercase tracking-wider text-muted">Helpful?</span>
        <button
          type="button"
          onClick={() => sendFeedback("up")}
          disabled={feedback !== null}
          aria-pressed={feedback === "up"}
          aria-label="Yes, this answer was helpful"
          className={`rounded border px-2 py-1 text-sm transition-colors ${
            feedback === "up"
              ? "border-green/50 bg-green/10"
              : "border-b1 hover:border-green/40"
          } disabled:cursor-default`}
        >
          👍
        </button>
        <button
          type="button"
          onClick={() => sendFeedback("down")}
          disabled={feedback !== null}
          aria-pressed={feedback === "down"}
          aria-label="No, this answer was not helpful"
          className={`rounded border px-2 py-1 text-sm transition-colors ${
            feedback === "down"
              ? "border-amber/50 bg-amber/10"
              : "border-b1 hover:border-amber/40"
          } disabled:cursor-default`}
        >
          👎
        </button>
      </div>
    </details>
  );
}

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
            <FAQItemRow key={item.question} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
