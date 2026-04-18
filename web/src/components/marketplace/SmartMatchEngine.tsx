"use client";

import { useState, useRef } from "react";
import { apiMutateJson } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";

interface MatchResult {
  type: "service" | "request" | "specialist";
  title: string;
  description: string;
  matchScore: number;
  matchReasons: string[];
  data: {
    id: string;
    imageUrl?: string;
    price?: number;
    creator?: { name: string; avatar: string; rating: number };
    skills?: string[];
  };
}

interface SmartMatchEngineProps {
  onSelectMatch?: (match: MatchResult) => void;
}

export function SmartMatchEngine({ onSelectMatch }: SmartMatchEngineProps) {
  const { accessToken } = useAuth();
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [showCreateListing, setShowCreateListing] = useState(false);
  const recognitionRef = useRef<{ stop: () => void } | null>(null);

  async function startVoiceInput() {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }

    type SpeechRec = new () => {
      continuous: boolean;
      interimResults: boolean;
      lang: string;
      onresult: ((event: { resultIndex: number; results: { isFinal: boolean; 0: { transcript: string } }[] }) => void) | null;
      onend: (() => void) | null;
      start: () => void;
      stop: () => void;
    };

    const SpeechRecognitionAPI = (window as { SpeechRecognition?: SpeechRec; webkitSpeechRecognition?: SpeechRec }).SpeechRecognition || (window as { SpeechRecognition?: SpeechRec; webkitSpeechRecognition?: SpeechRec }).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInput((prev) => prev + transcript);
    };

    recognition.onend = () => setIsRecording(false);

    recognition.start();
    setIsRecording(true);
    recognitionRef.current = recognition;
  }

  function stopVoiceInput() {
    recognitionRef.current?.stop();
    setIsRecording(false);
  }

  async function handleMatch() {
    if (!input.trim()) return;
    setIsProcessing(true);

    try {
      const response = await apiMutateJson<{
        matches: MatchResult[];
        suggestedListing?: {
          title: string;
          description: string;
          category: string;
          budgetRange: { min: number; max: number };
        };
      }>("/api/marketplace/smart-match", "POST", { query: input }, accessToken);

      setResults(response.matches);
      setShowCreateListing(response.matches.length === 0 || response.suggestedListing !== undefined);
    } catch (error) {
      console.error("Smart match failed:", error);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Input Section */}
      <div className="surface-card p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl text-primary">psychology</span>
          </div>
          <div>
            <h2 className="text-xl font-headline font-semibold text-on-surface">Smart Match Engine</h2>
            <p className="text-sm text-on-surface-variant">Describe what you need in 2 sentences. AI finds your perfect match.</p>
          </div>
        </div>

        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Example: I need a logo design for my tech startup. Budget is $500-1000, need it within 2 weeks."
            className="w-full h-28 px-4 py-3 pr-12 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            disabled={isProcessing}
          />
          <button
            onClick={isRecording ? stopVoiceInput : startVoiceInput}
            className={`absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              isRecording ? "bg-error text-on-error animate-pulse" : "bg-surface-container-high text-on-surface-variant hover:text-primary"
            }`}
          >
            <span className="material-symbols-outlined">{isRecording ? "stop" : "mic"}</span>
          </button>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={handleMatch}
            disabled={isProcessing || !input.trim()}
            className="flex-1 btn-primary min-h-12 disabled:opacity-50"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                Finding matches...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">search</span>
                Find Matches
              </span>
            )}
          </button>
          <button
            onClick={() => setShowCreateListing(true)}
            className="btn-secondary px-6"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined">add</span>
              Create Listing
            </span>
          </button>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-headline font-semibold text-on-surface">
              Top Matches ({results.length})
            </h3>
            <span className="text-sm text-on-surface-variant">Sorted by relevance</span>
          </div>

          {results.map((match, idx) => (
            <div
              key={match.data.id}
              onClick={() => onSelectMatch?.(match)}
              className="surface-card p-5 cursor-pointer hover:border-primary/50 transition-all group"
            >
              <div className="flex items-start gap-4">
                {/* Match Score Badge */}
                <div className="flex-shrink-0">
                  <div
                    className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center ${
                      match.matchScore >= 90
                        ? "bg-success/10 border-success/30"
                        : match.matchScore >= 70
                        ? "bg-primary/10 border-primary/30"
                        : "bg-amber-500/10 border-amber-500/30"
                    } border`}
                  >
                    <span className="text-lg font-bold text-on-surface">{match.matchScore}%</span>
                    <span className="text-[10px] text-on-surface-variant">match</span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs uppercase tracking-wide text-on-surface-variant font-medium">
                        {match.type}
                      </span>
                      <h4 className="text-lg font-headline font-semibold text-on-surface group-hover:text-primary transition-colors">
                        {match.title}
                      </h4>
                    </div>
                    {match.data.price && (
                      <span className="text-lg font-bold text-primary">${match.data.price}</span>
                    )}
                  </div>

                  <p className="text-sm text-on-surface-variant mt-1 line-clamp-2">
                    {match.description}
                  </p>

                  {/* Match Reasons */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {match.matchReasons.map((reason, ridx) => (
                      <span
                        key={ridx}
                        className="px-2 py-1 rounded-full bg-surface-container-high border border-outline-variant text-xs text-on-surface-variant"
                      >
                        {reason}
                      </span>
                    ))}
                  </div>

                  {/* Creator Info */}
                  {match.data.creator && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-outline-variant">
                      <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center">
                        {match.data.creator.avatar ? (
                          <img src={match.data.creator.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-sm">person</span>
                        )}
                      </div>
                      <span className="text-sm text-on-surface font-medium">
                        {match.data.creator.name}
                      </span>
                      <div className="flex items-center gap-1 text-amber-400">
                        <span className="material-symbols-outlined text-sm">star</span>
                        <span className="text-sm">{match.data.creator.rating}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Arrow */}
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">
                  arrow_forward
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results / Create Listing CTA */}
      {showCreateListing && results.length === 0 && (
        <div className="surface-card p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl text-on-surface-variant">search_off</span>
          </div>
          <h3 className="text-lg font-headline font-semibold text-on-surface mb-2">No exact matches found</h3>
          <p className="text-sm text-on-surface-variant mb-4 max-w-md mx-auto">
            Our AI analyzed your request and can create a listing that attracts the right specialists.
          </p>
          <button className="btn-primary">
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined">auto_awesome</span>
              AI-Generate Listing
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
