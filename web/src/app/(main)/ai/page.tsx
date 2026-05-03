import type { Metadata } from "next";
import { AIHubClient } from "./_components/AIHubClient";

export const metadata: Metadata = {
  title: "AI Hub — BrandForge",
  description: "Access AI tools for briefs, proposals, career advice, and deal assistance.",
};

export default function AIPage() {
  return (
    <div className="page-root">
      <div className="page-content">
        <AIHubClient />
      </div>
    </div>
  );
}
