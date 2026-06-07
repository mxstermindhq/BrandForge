"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { ChannelBar } from "@/components/search/ChannelBar";
import { PersonaChips } from "@/components/search/PersonaChips";
import { SearchInput } from "@/components/search/SearchInput";
import { StreamLeadCard } from "@/components/search/StreamLeadCard";
import { CHANNEL_META } from "@/lib/constants";
import type { ExtractedPersona, StreamLead } from "@/types";

const ALL_CHANNELS = Object.keys(CHANNEL_META);
const DEFAULT_CHANNELS = ["google", "linkedin", "reddit", "web"];

export default function SearchPage(): React.JSX.Element {
  const [personaText, setPersonaText] = useState("");
  const [selectedChannels, setSelectedChannels] = useState<string[]>(DEFAULT_CHANNELS);
  const [quantity, setQuantity] = useState(25);

  const [isSearching, setIsSearching] = useState(false);
  const [persona, setPersona] = useState<ExtractedPersona | null>(null);
  const [leads, setLeads] = useState<StreamLead[]>([]);
  const [channelStatus, setChannelStatus] = useState<
    Record<string, "idle" | "searching" | "done" | "error">
  >({});
  const [channelCounts, setChannelCounts] = useState<Record<string, number>>({});
  const [statusMessage, setStatusMessage] = useState("");
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const abortRef = useRef<AbortController | null>(null);

  const handleSearch = useCallback(async () => {
    if (!personaText.trim() || isSearching) return;

    setLeads([]);
    setPersona(null);
    setChannelStatus({});
    setChannelCounts({});
    setDone(false);
    setError("");
    setCampaignId(null);
    setIsSearching(true);

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/search/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          persona_text: personaText,
          channels: selectedChannels,
          quantity,
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        setError(err.error || "Search failed");
        setIsSearching(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setError("Search failed");
        setIsSearching(false);
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
          const eventLine = chunk.split("\n");
          const eventType = eventLine.find((l) => l.startsWith("event:"))?.replace("event: ", "");
          const dataLine = eventLine.find((l) => l.startsWith("data:"))?.replace("data: ", "");
          if (!eventType || !dataLine) continue;

          try {
            const data = JSON.parse(dataLine) as Record<string, unknown>;
            switch (eventType) {
              case "status":
                setStatusMessage(String(data.message ?? ""));
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
                setDone(true);
                setIsSearching(false);
                break;
              case "error":
                setError(String(data.message ?? "Search failed"));
                setIsSearching(false);
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
      }
    } finally {
      setIsSearching(false);
    }
  }, [personaText, selectedChannels, quantity, isSearching]);

  function handleStop(): void {
    abortRef.current?.abort();
    setIsSearching(false);
  }

  function toggleChannel(ch: string): void {
    setSelectedChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch],
    );
  }

  return (
    <div className="relative -mx-6 -my-8 min-h-[calc(100vh-4rem)] bg-[#080808] px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-zinc-600">Search / New</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Find Your Buyers</h1>
          <p className="mt-1 text-sm text-zinc-500">Describe who you&apos;re looking for. We&apos;ll find them.</p>
        </div>

        <SearchInput
          value={personaText}
          onChange={setPersonaText}
          onSubmit={() => void handleSearch()}
          onStop={handleStop}
          isSearching={isSearching}
          quantity={quantity}
          onQuantityChange={setQuantity}
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
                disabled={isSearching}
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

        {persona && <PersonaChips persona={persona} className="mt-6" />}

        {(isSearching || done) && (
          <ChannelBar
            channels={selectedChannels}
            status={channelStatus}
            counts={channelCounts}
            className="mt-8"
          />
        )}

        {isSearching && !leads.length && statusMessage && (
          <p className="mt-6 animate-pulse text-sm text-zinc-500">{statusMessage}</p>
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
                {isSearching && <span className="ml-2 text-zinc-600">· searching...</span>}
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

            {done && (
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
