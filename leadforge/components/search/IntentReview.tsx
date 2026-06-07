"use client";

import { buildIntentQueries } from "@/lib/channel-search";
import { CHANNEL_META } from "@/lib/constants";
import { ConfidenceRing } from "@/components/search/ConfidenceRing";
import type { ClarifyingQuestion, SiteAnalysisResult } from "@/types";

interface Props {
  analysis: SiteAnalysisResult;
  selectedChannels: string[];
  answers: Record<string, string>;
  onAnswer: (id: string, value: string) => void;
  onConfirm: () => void;
  onBack: () => void;
  isLoading: boolean;
  quantity: number;
}

export function IntentReview({
  analysis,
  selectedChannels,
  answers,
  onAnswer,
  onConfirm,
  onBack,
  isLoading,
  quantity,
}: Props): React.JSX.Element {
  const { website_analysis, clarifying_questions } = analysis;
  const wa = website_analysis;

  return (
    <div className="mt-6 space-y-4">
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="mb-1 text-[10px] uppercase tracking-widest text-zinc-600">We analyzed</p>
            <p className="text-base font-semibold text-white">{wa.company_name}</p>
            <p className="mt-0.5 text-xs text-zinc-500">{wa.product_summary}</p>
          </div>
          <div className="flex-shrink-0 text-right">
            <ConfidenceRing value={wa.confidence} />
            <p className="mt-1 max-w-[120px] text-right text-[10px] text-zinc-600">
              {wa.confidence_reason}
            </p>
          </div>
        </div>

        <div className="mb-4 rounded-lg border border-white/10 bg-white/[0.04] p-3">
          <p className="mb-1.5 text-[10px] uppercase tracking-widest text-zinc-600">
            Ideal Buyer Profile
          </p>
          <p className="text-sm leading-relaxed text-zinc-200">{wa.icp.one_liner}</p>
        </div>

        <div className="mb-4 grid grid-cols-3 gap-3 text-xs">
          <div>
            <p className="mb-1 text-zinc-600">Titles</p>
            <p className="text-zinc-300">{wa.icp.titles.slice(0, 3).join(", ") || "—"}</p>
          </div>
          <div>
            <p className="mb-1 text-zinc-600">Stage</p>
            <p className="text-zinc-300">{wa.icp.company_stage.slice(0, 2).join(", ") || "—"}</p>
          </div>
          <div>
            <p className="mb-1 text-zinc-600">Budget Signal</p>
            <p className="text-zinc-300">{wa.price_signal || wa.icp.budget_range || "—"}</p>
          </div>
        </div>

        <details className="group">
          <summary className="flex cursor-pointer list-none items-center gap-1.5 text-[11px] text-zinc-600 transition-colors hover:text-zinc-400">
            <span className="inline-block transition-transform group-open:rotate-90">›</span>
            Buying intent signals · {wa.intent_signals.length}
          </summary>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {wa.intent_signals.map((signal) => (
              <span
                key={signal}
                className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[10px] text-amber-400"
              >
                &ldquo;{signal}&rdquo;
              </span>
            ))}
          </div>
        </details>

        <details className="group mt-3">
          <summary className="flex cursor-pointer list-none items-center gap-1.5 text-[11px] text-zinc-600 transition-colors hover:text-zinc-400">
            <span className="inline-block transition-transform group-open:rotate-90">›</span>
            Preview search queries per channel
          </summary>
          <div className="mt-2 space-y-1.5">
            {selectedChannels.map((ch) => {
              const queries = buildIntentQueries(ch, wa);
              return (
                <div key={ch} className="text-xs">
                  <span className="font-medium text-zinc-600">
                    {CHANNEL_META[ch]?.label ?? ch}:
                  </span>
                  <span className="ml-2 font-mono text-[11px] text-zinc-500">{queries[0]}</span>
                </div>
              );
            })}
          </div>
        </details>

        {wa.data_quality_issues.length > 0 && (
          <div className="mt-3 rounded-lg border border-amber-500/10 bg-amber-500/5 p-2.5">
            <p className="text-[10px] text-amber-600">
              Low confidence: {wa.data_quality_issues.join(" · ")}
            </p>
          </div>
        )}
      </div>

      {clarifying_questions.length > 0 && (
        <div className="space-y-4 rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs text-zinc-500">Optional refinements:</p>
          {clarifying_questions.map((q) => (
            <QuestionField key={q.id} question={q} value={answers[q.id] ?? ""} onChange={onAnswer} />
          ))}
        </div>
      )}

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
