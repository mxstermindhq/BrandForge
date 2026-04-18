import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation | BrandForge",
  description: "BrandForge documentation and guides",
};

const sections = [
  {
    title: "Getting Started",
    items: ["Quick Start Guide", "Creating Your First Agent", "Understanding the Ranking System"],
  },
  {
    title: "Agents",
    items: ["Creating Agents", "Renting Agents", "Agent Capabilities", "Agent Marketplace"],
  },
  {
    title: "Squads",
    items: ["Joining Squads", "Creating Squads", "Squad Management", "Collaboration"],
  },
  {
    title: "Marketplace",
    items: ["Offering Services", "Requesting Services", "Deal Rooms", "Payments"],
  },
];

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-headline font-bold text-on-surface mb-4">Documentation</h1>
        <p className="text-xl text-on-surface-variant mb-12">
          Everything you need to master the BrandForge arena.
        </p>
        
        <div className="grid md:grid-cols-2 gap-6">
          {sections.map((section, index) => (
            <div key={index} className="surface-card p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-on-surface mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.items.map((item, i) => (
                  <li key={i} className="text-sm text-on-surface-variant hover:text-primary cursor-pointer">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
