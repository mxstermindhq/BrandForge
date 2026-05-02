"use client";

import { useState, useRef } from "react";
import { apiMutateJson } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import { AuthWall } from "@/components/ui/AuthWall";

interface GeneratedProposal {
  title: string;
  introduction: string;
  approach: string;
  methodology: string[];
  timeline: { phase: string; duration: string; deliverables: string[] }[];
  pricing: { item: string; amount: number; description?: string }[];
  totalAmount: number;
  whyChooseMe: string[];
  nextSteps: string;
}

interface AIProposalWriterProps {
  requestId?: string;
  requestTitle?: string;
  onProposalGenerated?: (proposal: GeneratedProposal) => void;
  onSubmit?: (proposal: GeneratedProposal) => void;
}

export function AIProposalWriter({ requestId, requestTitle, onProposalGenerated, onSubmit }: AIProposalWriterProps) {
  const { session, accessToken } = useAuth();
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProposal, setGeneratedProposal] = useState<GeneratedProposal | null>(null);
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

  async function generateProposal() {
    if (!input.trim()) return;

    // Trigger auth wall for guests immediately
    if (!session) {
      // Show preview skeleton for guests
      setGeneratedProposal({
        title: "Your Custom Proposal",
        introduction: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        approach: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        methodology: ["Lorem ipsum dolor sit amet", "Consectetur adipiscing elit", "Sed do eiusmod tempor"],
        timeline: [
          { phase: "Discovery", duration: "1 week", deliverables: ["Lorem ipsum", "Dolor sit amet"] },
          { phase: "Development", duration: "4 weeks", deliverables: ["Consectetur", "Adipiscing elit"] },
          { phase: "Launch", duration: "1 week", deliverables: ["Sed do eiusmod", "Tempor incididunt"] },
        ],
        pricing: [
          { item: "Development", amount: 5000, description: "Lorem ipsum dolor" },
          { item: "Design", amount: 2000, description: "Sit amet consectetur" },
        ],
        totalAmount: 7000,
        whyChooseMe: ["Lorem ipsum dolor sit amet", "Consectetur adipiscing elit", "Sed do eiusmod tempor"],
        nextSteps: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const response = await apiMutateJson<{
        proposal: GeneratedProposal;
        confidence: number;
      }>("/api/ai/generate-proposal", "POST", {
        input,
        requestId,
        requestTitle,
      }, accessToken);

      setGeneratedProposal(response.proposal);
      onProposalGenerated?.(response.proposal);
    } catch (error) {
      console.error("Failed to generate proposal:", error);
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
            <span className="material-symbols-outlined text-2xl text-primary">edit_document</span>
          </div>
          <div>
            <h2 className="text-xl font-headline font-semibold text-on-surface">AI Proposal Writer</h2>
            <p className="text-sm text-on-surface-variant">Describe your approach. AI crafts a winning proposal.</p>
          </div>
        </div>

        {requestTitle && (
          <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant mb-4">
            <span className="text-xs text-on-surface-variant uppercase tracking-wide">Responding to</span>
            <p className="font-medium text-on-surface">{requestTitle}</p>
          </div>
        )}

        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Example: I have 5 years of mobile app development experience. I'll build your fitness app with React Native, integrate with Apple Health and Google Fit, add real-time chat with trainers, and create an admin dashboard. My rate is $75/hour, estimated 200 hours total."
            className="w-full h-40 px-4 py-3 pr-12 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
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
          onClick={generateProposal}
          disabled={isGenerating || !input.trim()}
          className="w-full btn-primary min-h-12 mt-4 disabled:opacity-50"
        >
          {isGenerating ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
              Crafting Proposal...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">auto_awesome</span>
              Generate Proposal
            </span>
          )}
        </button>
      </div>

      {/* Generated Proposal Preview */}
      {generatedProposal && (
        <AuthWall
          feature="AI Proposal Writer"
          ctaText="Sign in to generate your proposal"
          preview={
            <div className="surface-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-2xl">description</span>
                  <h3 className="text-lg font-headline font-semibold text-on-surface">Proposal Preview</h3>
                </div>
                <span className="px-3 py-1 rounded-full bg-success/10 border border-success/30 text-success text-xs font-medium">
                  AI Generated
                </span>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-2xl font-headline font-bold text-on-surface">{generatedProposal.title}</h4>
                </div>
                <div>
                  <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wide">Introduction</label>
                  <p className="text-on-surface mt-2 leading-relaxed">{generatedProposal.introduction}</p>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border border-primary/30">
                  <span className="font-semibold text-on-surface">Total Investment</span>
                  <span className="text-2xl font-bold text-primary">${generatedProposal.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          }
        >
          <div className="surface-card p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-2xl">description</span>
                <h3 className="text-lg font-headline font-semibold text-on-surface">Generated Proposal</h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-success/10 border border-success/30 text-success text-xs font-medium">
                AI Generated
              </span>
            </div>

            <div className="space-y-6">
              {/* Title */}
              <div>
                <h4 className="text-2xl font-headline font-bold text-on-surface">{generatedProposal.title}</h4>
              </div>

              {/* Introduction */}
              <div>
                <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wide">Introduction</label>
                <p className="text-on-surface mt-2 leading-relaxed">{generatedProposal.introduction}</p>
              </div>

              {/* Approach */}
              <div>
                <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wide">My Approach</label>
                <p className="text-on-surface mt-2 leading-relaxed">{generatedProposal.approach}</p>
              </div>

              {/* Methodology */}
              <div>
                <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wide">Methodology</label>
                <div className="grid sm:grid-cols-2 gap-3 mt-2">
                  {generatedProposal.methodology.map((method, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-3 rounded-lg bg-surface-container-low">
                      <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                      <span className="text-sm text-on-surface">{method}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div>
                <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wide">Timeline</label>
                <div className="space-y-3 mt-2">
                  {generatedProposal.timeline.map((phase, idx) => (
                    <div key={idx} className="p-4 rounded-lg bg-surface-container-low border border-outline-variant">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-on-surface">{phase.phase}</span>
                        <span className="text-sm text-primary font-medium">{phase.duration}</span>
                      </div>
                      <ul className="space-y-1">
                        {phase.deliverables.map((del, didx) => (
                          <li key={didx} className="flex items-center gap-2 text-sm text-on-surface-variant">
                            <span className="material-symbols-outlined text-xs">arrow_right</span>
                            {del}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div>
                <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wide">Pricing Breakdown</label>
                <div className="mt-2 space-y-2">
                  {generatedProposal.pricing.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low">
                      <div>
                        <span className="text-on-surface font-medium">{item.item}</span>
                        {item.description && (
                          <p className="text-xs text-on-surface-variant">{item.description}</p>
                        )}
                      </div>
                      <span className="text-on-surface font-semibold">${item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border border-primary/30 mt-2">
                  <span className="font-semibold text-on-surface">Total Investment</span>
                  <span className="text-2xl font-bold text-primary">${generatedProposal.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Why Choose Me */}
              <div>
                <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wide">Why Choose Me</label>
                <ul className="mt-2 space-y-2">
                  {generatedProposal.whyChooseMe.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-amber-400 text-sm mt-0.5">star</span>
                      <span className="text-sm text-on-surface">{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Next Steps */}
              <div className="p-4 rounded-lg bg-surface-container-low">
                <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wide">Next Steps</label>
                <p className="text-on-surface mt-2">{generatedProposal.nextSteps}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-outline-variant">
                <button
                  onClick={() => onSubmit?.(generatedProposal)}
                  className="flex-1 btn-primary"
                >
                  <span className="flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">send</span>
                    Submit Proposal
                  </span>
                </button>
                <button
                  onClick={() => setGeneratedProposal(null)}
                  className="btn-secondary px-6"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        </AuthWall>
      )}
    </div>
  );
}
