"use client";

import { CHANNEL_META } from "@/lib/constants";
import type { ClarifyingQuestion, SearchIntentAnalysis } from "@/types";

interface Props {
  analysis: SearchIntentAnalysis;
  answers: Record<string, string>;
  onAnswer: (id: string, value: string) => void;
  onConfirm: () => void;
  onBack: () => void;
  isLoading: boolean;
  isRefining?: boolean;
  quantity: number;
}

export function IntentReview({
  analysis,
  answers,
  onAnswer,
  onConfirm,
  onBack,
  isLoading,
  isRefining = false,
  quantity,
}: Props): React.JSX.Element {
  const { persona, confidence, intent_summary, clarifying_questions, search_preview } = analysis;

  return (
    <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-zinc-600">We understood</p>
          <p className="mt-1 text-sm leading-relaxed text-zinc-200">{intent_summary}</p>
        </div>
        <div className="shrink-0 text-right">
          {isRefining && (
            <p className="mb-1 text-[10px] text-zinc-500 animate-pulse">Refining with AI...</p>
          )}
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
        {persona.locations.slice(0, 2).map((l) => (
          <span key={l} className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-400">
            {l}
          </span>
        ))}
      </div>

      {clarifying_questions.length > 0 && (
        <div className="mt-6 space-y-4">
          <p className="text-xs text-zinc-500">
            A few quick questions to sharpen your results:
          </p>
          {clarifying_questions.map((q) => (
            <QuestionField key={q.id} question={q} value={answers[q.id] ?? ""} onChange={onAnswer} />
          ))}
        </div>
      )}

      <details className="mt-5 group">
        <summary className="cursor-pointer text-xs text-zinc-600 transition-colors hover:text-zinc-400">
          Preview search queries per channel
        </summary>
        <div className="mt-2 space-y-1.5">
          {Object.entries(search_preview).map(([ch, query]) => (
            <div key={ch} className="rounded-lg bg-black/30 px-3 py-2 text-xs">
              <span className="font-medium text-zinc-500">{CHANNEL_META[ch]?.label ?? ch}: </span>
              <span className="text-zinc-400">{query}</span>
            </div>
          ))}
        </div>
      </details>

      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="text-xs text-zinc-600 transition-colors hover:text-zinc-400 disabled:opacity-50"
        >
          ← Edit description
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className="rounded-lg bg-white px-5 py-2 text-xs font-semibold text-black transition-colors hover:bg-zinc-200 disabled:opacity-50"
        >
          {isLoading ? "Starting..." : `Find ${quantity} leads →`}
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
          {question.placeholder && (
            <input
              type="text"
              value={question.options.includes(value) ? "" : value}
              onChange={(e) => onChange(question.id, e.target.value)}
              placeholder={question.placeholder}
              className="min-w-[180px] flex-1 rounded-lg border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-white outline-none placeholder:text-zinc-700"
            />
          )}
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
