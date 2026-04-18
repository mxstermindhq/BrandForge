"use client";

import { useState } from "react";
import { apiMutateJson } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";

const tools = [
  {
    id: "brief",
    name: "Brief Generator",
    description: "Generate comprehensive project briefs from a simple idea",
    icon: "📝",
    color: "from-primary/20 to-secondary/20",
  },
  {
    id: "proposal",
    name: "Proposal Writer",
    description: "Create winning proposals with AI-powered copy",
    icon: "📄",
    color: "from-secondary/20 to-tertiary/20",
  },
  {
    id: "contract",
    name: "Contract Review",
    description: "Analyze contracts and suggest improvements",
    icon: "⚖️",
    color: "from-tertiary/20 to-primary/20",
  },
];

export default function AIToolsPage() {
  const { accessToken } = useAuth();
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  async function generate(toolId: string) {
    if (!input.trim() || !accessToken) return;
    setIsGenerating(true);
    try {
      const result = await apiMutateJson<{ result: string }>(
        `/api/ai/generate`,
        "POST",
        { tool: toolId, input },
        accessToken
      );
      setOutput(result.result);
    } catch (err) {
      setOutput("Failed to generate. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-headline font-bold text-on-surface mb-2">
          AI Tools
        </h1>
        <p className="text-on-surface-variant">
          Supercharge your workflow with AI-powered assistants
        </p>
      </div>

      {/* AI Tools Content */}
      <div className="space-y-6">
        {/* Tool Grid */}
          {!activeTool && (
            <div className="grid md:grid-cols-3 gap-4">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id)}
                  className={`relative p-6 rounded-xl border border-outline-variant bg-gradient-to-br ${tool.color} hover:border-primary/50 transition-all text-left group`}
                >
                  <div className="text-3xl mb-3">{tool.icon}</div>
                  <h3 className="font-semibold text-on-surface mb-1">{tool.name}</h3>
                  <p className="text-sm text-on-surface-variant">{tool.description}</p>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-primary">arrow_forward</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Active Tool Interface */}
          {activeTool && (
            <div className="space-y-4">
              <button
                onClick={() => setActiveTool(null)}
                className="text-sm text-on-surface-variant hover:text-on-surface flex items-center gap-1"
              >
                <span className="material-symbols-outlined">arrow_back</span>
                Back to tools
              </button>

              <div className="bg-surface-container rounded-xl p-6 border border-outline-variant">
                <h2 className="text-xl font-semibold mb-4">
                  {tools.find(t => t.id === activeTool)?.name}
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-2">
                      Describe your project or idea
                    </label>
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="e.g., I need a website for my coffee shop that shows our menu and allows online orders..."
                      className="w-full h-32 p-4 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface placeholder:text-on-surface-variant/50 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  <button
                    onClick={() => generate(activeTool)}
                    disabled={!input.trim() || isGenerating}
                    className="btn-primary w-full sm:w-auto min-h-12 px-8 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                        Generating...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined">auto_awesome</span>
                        Generate
                      </span>
                    )}
                  </button>

                  {output && (
                    <div className="mt-6 p-4 bg-surface-container-high rounded-lg border border-outline-variant">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-on-surface">Result</h3>
                        <button
                          onClick={() => navigator.clipboard.writeText(output)}
                          className="text-sm text-primary hover:underline"
                        >
                          Copy to clipboard
                        </button>
                      </div>
                      <div className="prose prose-invert max-w-none">
                        <pre className="whitespace-pre-wrap text-sm text-on-surface-variant font-body">
                          {output}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
