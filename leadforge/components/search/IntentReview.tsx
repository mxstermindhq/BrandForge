"use client";

import { CHANNEL_META } from "@/lib/constants";
import type { ClarifyingQuestion, SiteAnalysisResult, SiteBusinessProfile } from "@/types";

interface Props {
  analysis: SiteAnalysisResult;
  answers: Record<string, string>;
  onAnswer: (id: string, value: string) => void;
  onConfirm: () => void;
  onBack: () => void;
  isLoading: boolean;
  quantity: number;
}

const OFFER_LABELS: Record<SiteBusinessProfile["offer_type"], string> = {
  product: "Product",
  service: "Service",
  saas: "SaaS",
  agency: "Agency",
  ecommerce: "E-commerce",
  mixed: "Mixed offer",
};

export function IntentReview({
  analysis,
  answers,
  onAnswer,
  onConfirm,
  onBack,
  isLoading,
  quantity,
}: Props): React.JSX.Element {
  const { site, persona, confidence, intent_summary, clarifying_questions, search_preview } =
    analysis;

  return (
    <div className="mt-6 space-y-4">
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <p className="text-[10px] uppercase tracking-widest text-zinc-600">We analyzed</p>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">{site.company_name}</h2>
            <a
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-zinc-500 hover:text-zinc-300"
            >
              {site.url}
            </a>
            {site.tagline && (
              <p className="mt-2 text-sm text-zinc-400">{site.tagline}</p>
            )}
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-400">
            {OFFER_LABELS[site.offer_type]}
          </span>
        </div>
        <dl className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
          <div>
            <dt className="text-zinc-600">What you sell</dt>
            <dd className="text-zinc-300">{site.what_they_sell}</dd>
          </div>
          {site.price_signal && (
            <div>
              <dt className="text-zinc-600">Pricing signal</dt>
              <dd className="text-zinc-300">{site.price_signal}</dd>
            </div>
          )}
        </dl>
      </div>

      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-emerald-600/80">
              Ideal buyer profile
            </p>
            <p className="mt-1 text-sm leading-relaxed text-zinc-200">{intent_summary}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[10px] uppercase tracking-widest text-zinc-600">Confidence</p>
            <p
              className={`mt-1 text-lg font-semibold tabular-nums ${
                confidence >= 70 ? "text-emerald-400" : confidence >= 50 ? "text-amber-400" : "text-zinc-400"
              }`}
            >
              {confidence}%
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {persona.titles.slice(0, 3).map((t) => (
            <span key={t} className="rounded-full bg-blue-500/10 px-2.5 py-1 text-xs text-blue-400">
              {t}
            </span>
          ))}
          {persona.industries.slice(0, 2).map((i) => (
            <span key={i} className="rounded-full bg-violet-500/10 px-2.5 py-1 text-xs text-violet-400">
              {i}
            </span>
          ))}
          {persona.pain_points.slice(0, 2).map((p) => (
            <span key={p} className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs text-amber-400">
              {p}
            </span>
          ))}
        </div>

        {persona.suggested_channels.length > 0 && (
          <p className="mt-3 text-xs text-zinc-500">
            Recommended channels:{" "}
            {persona.suggested_channels.map((c) => CHANNEL_META[c]?.label ?? c).join(", ")}
          </p>
        )}
      </div>

      {clarifying_questions.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
          <p className="text-xs text-zinc-500">Optional refinements:</p>
          {clarifying_questions.map((q) => (
            <QuestionField key={q.id} question={q} value={answers[q.id] ?? ""} onChange={onAnswer} />
          ))}
        </div>
      )}

      <details className="group rounded-xl border border-white/5 bg-black/20 px-4 py-3">
        <summary className="cursor-pointer text-xs text-zinc-600 transition-colors hover:text-zinc-400">
          Preview search queries per channel
        </summary>
        <div className="mt-2 space-y-1.5 pb-1">
          {Object.entries(search_preview).map(([ch, query]) => (
            <div key={ch} className="rounded-lg bg-black/30 px-3 py-2 text-xs">
              <span className="font-medium text-zinc-500">{CHANNEL_META[ch]?.label ?? ch}: </span>
              <span className="text-zinc-400">{query}</span>
            </div>
          ))}
        </div>
      </details>

      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="text-xs text-zinc-600 transition-colors hover:text-zinc-400 disabled:opacity-50"
        >
          ← Change website
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className="rounded-lg bg-white px-5 py-2 text-xs font-semibold text-black transition-colors hover:bg-zinc-200 disabled:opacity-50"
        >
          {isLoading ? "Starting..." : `Find ${quantity} buyers →`}
        </button>
      </div>
    </div>
  );
}

function QuestionField({
  question,
  value,
  onChange,
}: {
  question: ClarifyingQuestion;
  value: string;
  onChange: (id: string, value: string) => void;
}): React.JSX.Element {
  return (
    <div>
      <label className="mb-1.5 block text-sm text-zinc-300">{question.question}</label>
      {question.options && question.options.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {question.options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(question.id, opt)}
              className={`rounded-full border px-3 py-1 text-xs transition-all ${
                value === opt
                  ? "border-white/30 bg-white/10 text-white"
                  : "border-white/5 text-zinc-500 hover:border-white/15 hover:text-zinc-300"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(question.id, e.target.value)}
          placeholder={question.placeholder ?? "Your answer..."}
          className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-700"
        />
      )}
    </div>
  );
}
