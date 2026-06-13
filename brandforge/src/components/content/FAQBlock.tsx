"use client";

import { useCallback, useState } from "react";
import type { FaqItem } from "@/types/content";
import { trackEvent } from "@/lib/tracking";

const FEEDBACK_STORAGE_KEY = "bf-faq-feedback";

type StoredFeedback = {
  page: string;
  question_slug: string;
  value: 1 | -1;
  comment?: string;
  ts: number;
};

function faqSlug(question: string): string {
  return question
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72);
}

function readFeedbackLog(): StoredFeedback[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredFeedback[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function appendFeedback(entry: StoredFeedback): void {
  const log = readFeedbackLog();
  log.push(entry);
  localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(log));
}

type FAQBlockProps = {
  title?: string;
  items: readonly FaqItem[];
  id?: string;
  pageSlug?: string;
};

function FAQItemRow({
  item,
  pageSlug,
}: {
  item: FaqItem;
  pageSlug: string;
}): React.JSX.Element {
  const slug = faqSlug(item.question);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const [comment, setComment] = useState("");
  const [showCheck, setShowCheck] = useState(false);

  const sendFeedback = useCallback(
    (vote: "up" | "down"): void => {
      setFeedback(vote);
      const value = vote === "up" ? 1 : -1;
      appendFeedback({ page: pageSlug, question_slug: slug, value, ts: Date.now() });
      trackEvent("faq_helpful", { page: pageSlug, question_slug: slug, value });
      trackEvent("faq_feedback", { page: pageSlug, question_slug: slug, value, vote });
      if (vote === "up") {
        setShowCheck(true);
        window.setTimeout(() => setShowCheck(false), 1200);
      }
    },
    [pageSlug, slug],
  );

  const submitComment = useCallback((): void => {
    if (!comment.trim()) return;
    const log = readFeedbackLog();
    const idx = log.findIndex((e) => e.page === pageSlug && e.question_slug === slug);
    if (idx >= 0) {
      log[idx] = { ...log[idx]!, comment: comment.trim() };
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(log));
    }
    trackEvent("faq_helpful", {
      page: pageSlug,
      question_slug: slug,
      value: -1,
      has_comment: 1,
    });
  }, [comment, pageSlug, slug]);

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
        {showCheck ? (
          <span className="font-mono text-[10px] text-green motion-safe:animate-pulse" aria-live="polite">
            ✓ Thanks
          </span>
        ) : null}
      </div>
      {feedback === "down" ? (
        <div className="mt-3 max-w-xl">
          <label htmlFor={`faq-comment-${slug}`} className="font-mono text-[9px] uppercase text-muted">
            What was missing? (optional)
          </label>
          <textarea
            id={`faq-comment-${slug}`}
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onBlur={submitComment}
            className="mt-1 w-full rounded border border-b1 bg-bg p-2 text-sm text-text-secondary"
            placeholder="Tell us what to clarify…"
          />
        </div>
      ) : null}
    </details>
  );
}

/** FAQ section optimised for AI extraction — questions phrased as users ask them. */
export function FAQBlock({
  title = "Questions operators ask",
  items,
  id = "faq",
  pageSlug = "unknown",
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
            <FAQItemRow key={item.question} item={item} pageSlug={pageSlug} />
          ))}
        </div>
      </div>
    </section>
  );
}
