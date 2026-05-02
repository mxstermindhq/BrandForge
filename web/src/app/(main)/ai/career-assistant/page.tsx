import type { Metadata } from "next";
import { AICareerAssistant } from "@/components/ai/AICareerAssistant";

export const metadata: Metadata = {
  title: "AI Career Assistant | BrandForge",
  description: "Get personalized career advice from AI. Ask about pricing, client acquisition, skill development, and growing your freelance business.",
};

export default function CareerAssistantPage() {
  return (
    <main className="min-h-screen bg-background text-on-surface py-12 px-4">
      <AICareerAssistant />
    </main>
  );
}
