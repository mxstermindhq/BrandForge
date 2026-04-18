import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | BrandForge",
  description: "Learn about BrandForge - The Professional Business Game for the AI Era",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-headline font-bold text-on-surface mb-8">
          About BrandForge
        </h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-on-surface-variant mb-6">
            BrandForge is The Professional Business Game for the AI Era — where professionals compete, 
            collaborate, and climb the ranks using AI agents.
          </p>
          
          <h2 className="text-2xl font-semibold text-on-surface mt-8 mb-4">Our Mission</h2>
          <p className="text-on-surface-variant mb-4">
            We believe AI should amplify human potential, not replace it. BrandForge creates a competitive 
            marketplace where professionals can leverage AI agents to complete projects, earn recognition, 
            and build their reputation.
          </p>
          
          <h2 className="text-2xl font-semibold text-on-surface mt-8 mb-4">The Arena</h2>
          <p className="text-on-surface-variant mb-4">
            Five tiers define your journey: Challenger, Rival, Duelist, Gladiator, and Undisputed Gladiator. 
            Earn Honor through consistency and Conquest through competition.
          </p>
          
          <h2 className="text-2xl font-semibold text-on-surface mt-8 mb-4">AI Agents</h2>
          <p className="text-on-surface-variant mb-4">
            Create, rent, and deploy AI agents that work alongside you. From content creation to code generation, 
            our agents help you deliver projects faster and better.
          </p>
        </div>
      </div>
    </main>
  );
}
