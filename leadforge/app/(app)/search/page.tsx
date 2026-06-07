"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { ChannelBar } from "@/components/search/ChannelBar";
import { IntentReview } from "@/components/search/IntentReview";
import { PersonaChips } from "@/components/search/PersonaChips";
import { SiteUrlInput } from "@/components/search/SiteUrlInput";
import { StreamLeadCard } from "@/components/search/StreamLeadCard";
import { CHANNEL_META } from "@/lib/constants";
import type { ExtractedPersona, SiteAnalysisResult, StreamLead } from "@/types";

const ALL_CHANNELS = Object.keys(CHANNEL_META);
const DEFAULT_CHANNELS = ["google", "linkedin", "web"];

type Phase = "input" | "analyzing" | "confirm" | "searching" | "done";

export default function SearchPage(): React.JSX.Element {
  const [siteUrl, setSiteUrl] = useState("");
  const [selectedChannels, setSelectedChannels] = useState<string[]>(DEFAULT_CHANNELS);
  const [quantity, setQuantity] = useState(25);

  const [phase, setPhase] = useState<Phase>("input");
  const [analysis, setAnalysis] = useState<SiteAnalysisResult | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [persona, setPersona] = useState<ExtractedPersona | null>(null);
  const [leads, setLeads] = useState<StreamLead[]>([]);
  const [channelStatus, setChannelStatus] = useState<
    Record<string, "idle" | "searching" | "done" | "error">
  >({});
  const [channelCounts, setChannelCounts] = useState<Record<string, number>>({});
  const [statusMessage, setStatusMessage] = useState("");
  const [enrichProgress, setEnrichProgress] = useState<{ current: number; total: number } | null>(
    null,
  );
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const abortRef = useRef<AbortController | null>(null);

  const resetSearchState = useCallback(() => {
    setLeads([]);
    setPersona(null);
    setChannelStatus({});
    setChannelCounts({});
    setCampaignId(null);
    setEnrichProgress(null);
    setError("");
    setStatusMessage("");
  }, []);

  const runStream = useCallback(
    async (intent: SiteAnalysisResult, clarifyingAnswers: Record<string, string>) => {
      abortRef.current = new AbortController();
      setPhase("searching");
      setPersona(intent.persona);

      try {
        const res = await fetch("/api/search/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            site_url: intent.source_url,
            site: intent.site,
            website_analysis: intent.website_analysis,
            persona_text: intent.persona_text,
            channels: selectedChannels,
            quantity,
            extracted_persona: intent.persona,
            intent_summary: intent.intent_summary,
            clarifying_answers: clarifyingAnswers,
          }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          const err = (await res.json().catch(() => ({}))) as { error?: string };
          setError(err.error || "Search failed");
          setPhase("confirm");
          return;
        }

        const reader = res.body?.getReader();
        if (!reader) {
          setError("Search failed");
          setPhase("confirm");
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done: streamDone, value } = await reader.read();
          if (streamDone) break;

          buffer += decoder.decode(value, { stream: true });
          const chunks = buffer.split("\n\n");
          buffer = chunks.pop() || "";

          for (const chunk of chunks) {
            if (chunk.startsWith(":")) continue;
            const eventLine = chunk.split("\n");
            const eventType = eventLine.find((l) => l.startsWith("event:"))?.replace("event: ", "");
            const dataLine = eventLine.find((l) => l.startsWith("data:"))?.replace("data: ", "");
            if (!eventType || !dataLine) continue;

            try {
              const data = JSON.parse(dataLine) as Record<string, unknown>;
              switch (eventType) {
                case "status":
                  setStatusMessage(String(data.message ?? ""));
                  if (data.progress && typeof data.progress === "object") {
                    const p = data.progress as { current?: number; total?: number };
                    if (p.current && p.total) {
                      setEnrichProgress({ current: p.current, total: p.total });
                    }
                  }
                  break;
                case "persona":
                  setPersona(data as unknown as ExtractedPersona);
                  break;
                case "campaign":
                  setCampaignId(String(data.id ?? ""));
                  break;
                case "channel_start":
                  setChannelStatus((prev) => ({
                    ...prev,
                    [String(data.channel)]: "searching",
                  }));
                  break;
                case "lead": {
                  const lead = data as unknown as StreamLead;
                  setLeads((prev) =>
                    [...prev, lead].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)),
                  );
                  setChannelCounts((prev) => ({
                    ...prev,
                    [lead.platform]: (prev[lead.platform] || 0) + 1,
                  }));
                  break;
                }
                case "channel_done":
                  setChannelStatus((prev) => ({
                    ...prev,
                    [String(data.channel)]: "done",
                  }));
                  break;
                case "channel_error":
                  setChannelStatus((prev) => ({
                    ...prev,
                    [String(data.channel)]: "error",
                  }));
                  break;
                case "done":
                  setPhase("done");
                  setEnrichProgress(null);
                  break;
                case "error":
                  setError(String(data.message ?? "Search failed"));
                  setPhase("confirm");
                  break;
                case "heartbeat":
                  break;
              }
            } catch {
              /* skip malformed event */
            }
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError("Connection lost. Please try again.");
          setPhase("confirm");
        }
      }
    },
    [selectedChannels, quantity],
  );

  const handleAnalyzeSite = useCallback(async () => {
    if (!siteUrl.trim() || phase === "analyzing" || phase === "searching") return;

    resetSearchState();
    setPhase("analyzing");
    setStatusMessage("Reading your website...");
    setAnswers({});

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/search/analyze-site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          site_url: siteUrl,
          channels: selectedChannels,
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        setError(err.error || "Could not analyze this website");
        setPhase("input");
        return;
      }

      const json = (await res.json()) as { data?: SiteAnalysisResult };
      if (!json.data) {
        setError("Analysis failed");
        setPhase("input");
        return;
      }

      setAnalysis(json.data);
      setPersona(json.data.persona);

      const suggested = json.data.persona.suggested_channels.filter((c) =>
        ALL_CHANNELS.includes(c),
      );
      if (suggested.length > 0) {
        setSelectedChannels(suggested);
      }

      setPhase("confirm");
      setStatusMessage("");
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError("Could not analyze this website. Check the URL and try again.");
        setPhase("input");
      }
    }
  }, [siteUrl, selectedChannels, phase, resetSearchState]);

  const handleConfirmSearch = useCallback(async () => {
    if (!analysis) return;
    resetSearchState();
    await runStream(analysis, answers);
  }, [analysis, answers, resetSearchState, runStream]);

  function handleStop(): void {
    abortRef.current?.abort();
    setPhase(analysis ? "confirm" : "input");
    setEnrichProgress(null);
  }

  function handleBackToInput(): void {
    abortRef.current?.abort();
    setPhase("input");
    setAnalysis(null);
    resetSearchState();
  }

  function toggleChannel(ch: string): void {
    if (phase === "searching" || phase === "analyzing") return;
    setSelectedChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch],
    );
  }

  function handleAnswer(id: string, value: string): void {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  const isBusy = phase === "analyzing" || phase === "searching";

  return (
    <div className="relative -mx-6 -my-8 min-h-[calc(100vh-4rem)] bg-[#080808] px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-zinc-600">Search / New</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            Find Your Ideal Buyers
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Paste your website — we analyze what you sell and scrape matching leads.
          </p>
        </div>

        <SiteUrlInput
          value={siteUrl}
          onChange={setSiteUrl}
          onSubmit={() => void handleAnalyzeSite()}
          onStop={handleStop}
          isBusy={isBusy}
          quantity={quantity}
          onQuantityChange={setQuantity}
          submitLabel={phase === "confirm" ? "Re-analyze site" : "Analyze website"}
        />

        <div className="mt-4 flex flex-wrap gap-2">
          {ALL_CHANNELS.map((ch) => {
            const meta = CHANNEL_META[ch];
            const active = selectedChannels.includes(ch);
            return (
              <button
                key={ch}
                type="button"
                onClick={() => toggleChannel(ch)}
                disabled={isBusy}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
                  active
                    ? "border-white/20 bg-white/10 text-white"
                    : "border-white/5 bg-transparent text-zinc-600 hover:text-zinc-400"
                }`}
              >
                {meta.label}
              </button>
            );
          })}
        </div>

        {phase === "analyzing" && (
          <div className="mt-6 flex items-center gap-3 text-sm text-zinc-500">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-600 border-t-white" />
            {statusMessage || "Analyzing your website..."}
          </div>
        )}

        {phase === "confirm" && analysis && (
          <IntentReview
            analysis={analysis}
            selectedChannels={selectedChannels}
            answers={answers}
            onAnswer={handleAnswer}
            onConfirm={() => void handleConfirmSearch()}
            onBack={handleBackToInput}
            isLoading={false}
            quantity={quantity}
          />
        )}

        {persona && phase !== "confirm" && phase !== "input" && (
          <PersonaChips persona={persona} className="mt-6" />
        )}

        {(phase === "searching" || phase === "done") && (
          <ChannelBar
            channels={selectedChannels}
            status={channelStatus}
            counts={channelCounts}
            className="mt-8"
          />
        )}

        {phase === "searching" && statusMessage && (
          <div className="mt-6">
            <p className="text-sm text-zinc-500">{statusMessage}</p>
            {enrichProgress && (
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full bg-white/30 transition-all duration-300"
                  style={{
                    width: `${Math.round((enrichProgress.current / enrichProgress.total) * 100)}%`,
                  }}
                />
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {leads.length > 0 && (
          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-zinc-400">
                {leads.length} lead{leads.length !== 1 ? "s" : ""} found
                {phase === "searching" && (
                  <span className="ml-2 text-zinc-600">· enriching...</span>
                )}
              </span>
              {campaignId && (
                <Link
                  href={`/campaigns/${campaignId}`}
                  className="text-xs text-zinc-600 transition-colors hover:text-zinc-400"
                >
                  View full campaign →
                </Link>
              )}
            </div>

            <div className="grid gap-3">
              {leads.map((lead, i) => (
                <StreamLeadCard key={lead.id || i} lead={lead} index={i} />
              ))}
            </div>

            {phase === "done" && (
              <div className="mt-6 rounded-lg border border-white/5 bg-white/[0.03] p-4 text-center">
                <p className="text-sm text-zinc-400">
                  Search complete · {leads.length} leads found
                </p>
                <Link
                  href="/leads"
                  className="mt-2 inline-block text-xs text-zinc-600 transition-colors hover:text-white"
                >
                  Manage all leads →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
