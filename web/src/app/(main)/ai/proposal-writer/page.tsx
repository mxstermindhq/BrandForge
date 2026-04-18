import type { Metadata } from "next";
import { AIProposalWriter } from "@/components/ai/AIProposalWriter";

export const metadata: Metadata = {
  title: "AI Proposal Writer",
  description: "Generate winning proposals with voice or text. AI crafts professional responses to project requests.",
};

export default function ProposalWriterPage() {
  return (
    <div className="page-root">
      <div className="page-content">
        <div className="mb-8">
          <p className="section-label !mb-3">AI Tools</p>
          <h1 className="page-title">Proposal Writer</h1>
          <p className="page-subtitle max-w-xl">
            Describe your approach and pricing. AI generates a compelling proposal with timeline, methodology, and deliverables.
          </p>
        </div>
        <AIProposalWriter />
      </div>
    </div>
  );
}
