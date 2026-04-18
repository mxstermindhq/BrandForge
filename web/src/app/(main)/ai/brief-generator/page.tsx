import type { Metadata } from "next";
import { AIBriefGenerator } from "@/components/ai/AIBriefGenerator";

export const metadata: Metadata = {
  title: "AI Brief Generator",
  description: "Generate professional project briefs with voice or text input. AI transforms your ideas into structured requirements.",
};

export default function BriefGeneratorPage() {
  return (
    <div className="page-root">
      <div className="page-content">
        <div className="mb-8">
          <p className="section-label !mb-3">AI Tools</p>
          <h1 className="page-title">Brief Generator</h1>
          <p className="page-subtitle max-w-xl">
            Describe your project in 2 sentences. AI creates a professional brief with requirements, timeline, and budget.
          </p>
        </div>
        <AIBriefGenerator />
      </div>
    </div>
  );
}
