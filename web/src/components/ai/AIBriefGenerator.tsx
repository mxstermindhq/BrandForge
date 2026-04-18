"use client";

import { useState, useRef } from "react";
import { apiMutateJson } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";

interface GeneratedBrief {
  title: string;
  description: string;
  requirements: string[];
  deliverables: string[];
  timeline: string;
  budget: { min: number; max: number; currency: string };
  skills: string[];
  category: string;
}

interface AIBriefGeneratorProps {
  onBriefGenerated?: (brief: GeneratedBrief) => void;
  onPublish?: (brief: GeneratedBrief) => void;
}

export function AIBriefGenerator({ onBriefGenerated, onPublish }: AIBriefGeneratorProps) {
  const { accessToken } = useAuth();
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBrief, setGeneratedBrief] = useState<GeneratedBrief | null>(null);
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

  async function generateBrief() {
    if (!input.trim()) return;
    setIsGenerating(true);

    try {
      const response = await apiMutateJson<{
        brief: GeneratedBrief;
        suggestedCategory: string;
        confidence: number;
      }>("/api/ai/generate-brief", "POST", { input }, accessToken);

      setGeneratedBrief(response.brief);
      onBriefGenerated?.(response.brief);
    } catch (error) {
      console.error("Failed to generate brief:", error);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Input Section */}
      <div className="surface-card p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl text-primary">edit_note</span>
          </div>
          <div>
            <h2 className="text-xl font-headline font-semibold text-on-surface">AI Brief Generator</h2>
            <p className="text-sm text-on-surface-variant">Describe your project. AI creates a professional brief.</p>
          </div>
        </div>

        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Example: I need a mobile app for my fitness startup. It should track workouts, nutrition, and connect users with trainers. Budget around $15000, need MVP in 3 months."
            className="w-full h-32 px-4 py-3 pr-12 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            disabled={isGenerating}
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

        <button
          onClick={generateBrief}
          disabled={isGenerating || !input.trim()}
          className="w-full btn-primary min-h-12 mt-4 disabled:opacity-50"
        >
          {isGenerating ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
              Generating Brief...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">auto_awesome</span>
              Generate Brief
            </span>
          )}
        </button>
      </div>

      {/* Generated Brief Preview */}
      {generatedBrief && (
        <div className="surface-card p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-2xl">description</span>
              <h3 className="text-lg font-headline font-semibold text-on-surface">Generated Brief</h3>
            </div>
            <span className="px-3 py-1 rounded-full bg-success/10 border border-success/30 text-success text-xs font-medium">
              AI Generated
            </span>
          </div>

          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wide">Project Title</label>
              <h4 className="text-xl font-headline font-bold text-on-surface mt-1">{generatedBrief.title}</h4>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wide">Description</label>
              <p className="text-on-surface mt-1 leading-relaxed">{generatedBrief.description}</p>
            </div>

            {/* Two Column Layout */}
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Requirements */}
              <div>
                <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wide">Requirements</label>
                <ul className="mt-2 space-y-2">
                  {generatedBrief.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-success text-sm mt-0.5">check_circle</span>
                      <span className="text-sm text-on-surface">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Deliverables */}
              <div>
                <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wide">Deliverables</label>
                <ul className="mt-2 space-y-2">
                  {generatedBrief.deliverables.map((del, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-primary text-sm mt-0.5">inventory</span>
                      <span className="text-sm text-on-surface">{del}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Timeline & Budget */}
            <div className="grid sm:grid-cols-3 gap-4 p-4 rounded-lg bg-surface-container-low">
              <div>
                <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wide">Timeline</label>
                <p className="text-lg font-semibold text-on-surface">{generatedBrief.timeline}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wide">Budget Range</label>
                <p className="text-lg font-semibold text-on-surface">
                  ${generatedBrief.budget.min.toLocaleString()} - ${generatedBrief.budget.max.toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wide">Category</label>
                <p className="text-lg font-semibold text-on-surface">{generatedBrief.category}</p>
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wide">Required Skills</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {generatedBrief.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-outline-variant">
              <button
                onClick={() => onPublish?.(generatedBrief)}
                className="flex-1 btn-primary"
              >
                <span className="flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">publish</span>
                  Publish Request
                </span>
              </button>
              <button
                onClick={() => setGeneratedBrief(null)}
                className="btn-secondary px-6"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
