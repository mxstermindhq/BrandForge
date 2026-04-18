"use client";

import { useState } from "react";
import { apiMutateJson } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";

// Speech Recognition types
type SpeechRecognitionCtor = new () => {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: { resultIndex: number; results: { isFinal: boolean; 0: { transcript: string } }[] }) => void) | null;
  start: () => void;
  stop: () => void;
};

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  }
}

interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const templates: ContractTemplate[] = [
  { id: "service", name: "Service Agreement", description: "For one-time services", icon: "handshake" },
  { id: "project", name: "Project Contract", description: "Multi-milestone projects", icon: "assignment" },
  { id: "retainer", name: "Retainer Agreement", description: "Monthly recurring services", icon: "event_repeat" },
  { id: "custom", name: "Custom Contract", description: "Built from your terms", icon: "edit_document" },
];

interface ContractGeneratorProps {
  chatId: string;
  otherParty: { id: string; name: string; email: string };
  dealContext?: {
    title?: string;
    description?: string;
    amount?: number;
    proposedMilestones?: { title: string; amount: number; description?: string }[];
  };
  onContractGenerated?: (contractId: string) => void;
}

export function ContractGenerator({ chatId, otherParty, dealContext, onContractGenerated }: ContractGeneratorProps) {
  const { session, accessToken } = useAuth();
  const user = session?.user;
  const [selectedTemplate, setSelectedTemplate] = useState<string>("service");
  const [mode, setMode] = useState<"template" | "voice" | "text">("template");
  const [voiceInput, setVoiceInput] = useState("");
  const [textInput, setTextInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContract, setGeneratedContract] = useState<string | null>(null);
  const [contractData, setContractData] = useState<{
    title: string;
    scope: string;
    amount: number;
    milestones: { title: string; amount: number; dueDays: number }[];
    paymentTerms: string;
    deliverables: string[];
  } | null>(null);

  async function startVoiceRecording() {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onresult = (event) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      setVoiceInput((prev) => prev + finalTranscript);
    };

    recognition.start();
  }

  async function generateContract() {
    setIsGenerating(true);
    try {
      const input = mode === "voice" ? voiceInput : mode === "text" ? textInput : "";
      
const response = await apiMutateJson<{
        contractId: string;
        contractText: string;
        parsed: {
          title: string;
          scope: string;
          amount: number;
          milestones: { title: string; amount: number; dueDays: number }[];
          paymentTerms: string;
          deliverables: string[];
        };
      }>("/api/contracts/generate", "POST", {
        chatId,
        templateType: selectedTemplate,
        mode,
        input,
        dealContext,
parties: {
          client: { id: user?.id, name: user?.user_metadata?.full_name || user?.email, email: user?.email },
          provider: otherParty,
        },
      }, accessToken);

      setGeneratedContract(response.contractText);
      setContractData(response.parsed);
      onContractGenerated?.(response.contractId);
    } catch (error) {
      console.error("Failed to generate contract:", error);
      alert("Failed to generate contract. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="surface-card max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">description</span>
          </div>
          <div>
            <h2 className="text-xl font-headline font-semibold text-on-surface">Contract Generator</h2>
            <p className="text-sm text-on-surface-variant">Generate professional contracts in one click</p>
          </div>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="flex gap-2 mb-6">
        {[
          { id: "template", label: "Template", icon: "description" },
          { id: "text", label: "Text to Contract", icon: "edit" },
          { id: "voice", label: "Voice to Contract", icon: "mic" },
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id as typeof mode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              mode === m.id
                ? "bg-primary text-on-primary border-primary"
                : "bg-surface-container-low border-outline-variant text-on-surface-variant hover:border-outline"
            }`}
          >
            <span className="material-symbols-outlined text-sm">{m.icon}</span>
            <span className="text-sm font-medium">{m.label}</span>
          </button>
        ))}
      </div>

      {/* Template Selection */}
      {mode === "template" && (
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => setSelectedTemplate(template.id)}
              className={`p-4 rounded-xl border text-left transition-all ${
                selectedTemplate === template.id
                  ? "bg-primary/5 border-primary shadow-sm"
                  : "bg-surface-container-low border-outline-variant hover:border-outline"
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`material-symbols-outlined ${
                    selectedTemplate === template.id ? "text-primary" : "text-on-surface-variant"
                  }`}
                >
                  {template.icon}
                </span>
                <div>
                  <h3 className="font-medium text-on-surface">{template.name}</h3>
                  <p className="text-sm text-on-surface-variant">{template.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Text Input */}
      {mode === "text" && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-on-surface mb-2">
            Describe your contract terms
          </label>
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Example: I need a contract for a website design project. Budget is $5000, 50% upfront, 50% on completion. Timeline is 4 weeks. Include 3 revision rounds."
            className="w-full h-32 px-4 py-3 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
          <p className="text-xs text-on-surface-variant mt-2">
            Be specific about scope, timeline, payment terms, and deliverables.
          </p>
        </div>
      )}

      {/* Voice Input */}
      {mode === "voice" && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-on-surface mb-2">
            Speak your contract terms
          </label>
          <div className="relative">
            <textarea
              value={voiceInput}
              onChange={(e) => setVoiceInput(e.target.value)}
              placeholder="Click the microphone button and speak your contract terms..."
              className="w-full h-32 px-4 py-3 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
            <button
              onClick={startVoiceRecording}
              className={`absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                isRecording
                  ? "bg-error text-on-error animate-pulse"
                  : "bg-primary text-on-primary"
              }`}
            >
              <span className="material-symbols-outlined">{isRecording ? "stop" : "mic"}</span>
            </button>
          </div>
          {isRecording && (
            <p className="text-xs text-error mt-2 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
              Recording... Speak clearly
            </p>
          )}
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={generateContract}
        disabled={isGenerating || (mode !== "template" && !(voiceInput || textInput))}
        className="w-full btn-primary min-h-12 mb-6 disabled:opacity-50"
      >
        {isGenerating ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
            Generating Contract...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">auto_awesome</span>
            Generate Contract
          </span>
        )}
      </button>

      {/* Generated Contract Preview */}
      {generatedContract && contractData && (
        <div className="border border-outline-variant rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-surface-container-high border-b border-outline-variant flex items-center justify-between">
            <span className="font-medium text-on-surface">Contract Preview</span>
            <span className="text-xs px-2 py-1 rounded-full bg-success/10 text-success border border-success/30">
              Generated by AI
            </span>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-on-surface-variant uppercase tracking-wide">Title</label>
                <p className="text-sm font-medium text-on-surface">{contractData.title}</p>
              </div>
              <div>
                <label className="text-xs text-on-surface-variant uppercase tracking-wide">Total Amount</label>
                <p className="text-sm font-medium text-on-surface">${contractData.amount.toLocaleString()}</p>
              </div>
            </div>
            <div>
              <label className="text-xs text-on-surface-variant uppercase tracking-wide">Scope</label>
              <p className="text-sm text-on-surface">{contractData.scope}</p>
            </div>
            {contractData.milestones.length > 0 && (
              <div>
                <label className="text-xs text-on-surface-variant uppercase tracking-wide">Milestones</label>
                <div className="mt-2 space-y-2">
                  {contractData.milestones.map((m, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low">
                      <span className="text-sm text-on-surface">{m.title}</span>
                      <span className="text-sm font-medium text-on-surface">${m.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="bg-surface-container-low rounded-lg p-3 max-h-48 overflow-y-auto">
              <pre className="text-xs text-on-surface-variant whitespace-pre-wrap">{generatedContract}</pre>
            </div>
            <div className="flex gap-3">
              <button className="flex-1 btn-primary">Send for Signature</button>
              <button className="btn-secondary px-4">Edit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
