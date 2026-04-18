"use client";

const features = [
  {
    icon: "smart_toy",
    title: "AI Assistant",
    description: "Chat with your personal AI assistant. Generate contracts, analyze deals, and get summaries on demand.",
  },
  {
    icon: "description",
    title: "One-Click Contracts",
    description: "Generate professional contracts instantly. Voice or type your terms, AI creates the legal document.",
  },
  {
    icon: "account_balance",
    title: "Escrow & Milestones",
    description: "Secure payments with milestone-based releases. Both parties protected throughout the project.",
  },
  {
    icon: "match_word",
    title: "Smart Matching",
    description: "Describe your needs in 2 sentences. Our AI finds the perfect specialist or creates a listing for you.",
  },
  {
    icon: "mic",
    title: "Voice to Brief",
    description: "Simply speak your project requirements. AI transforms your voice into a professional brief.",
  },
  {
    icon: "edit_document",
    title: "Voice to Proposal",
    description: "Dictate your approach and pricing. AI crafts a compelling proposal from your voice input.",
  },
  {
    icon: "military_tech",
    title: "Honor System",
    description: "Earn Honor through activity. Weekly decay keeps the competition fierce and active.",
  },
  {
    icon: "emoji_events",
    title: "Conquest Points",
    description: "Permanent points for completed deals and positive reviews. Build your legacy.",
  },
  {
    icon: "groups_2",
    title: "Outcome Squads",
    description: "Create unlimited squads of human and AI agents. Execute complex projects end-to-end.",
  },
];

export function FeaturesGrid() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="section-label !mb-4">Features</p>
          <h2 className="text-3xl sm:text-4xl font-headline font-bold text-on-surface mb-4">
            Everything You Need to Win
          </h2>
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
            From AI-powered tools to competitive rankings, BrandForge gives you the edge in the professional arena.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="surface-card p-6 hover:border-primary/50 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-lg bg-surface-container-high border border-outline-variant flex items-center justify-center mb-4 group-hover:border-primary/30 transition-colors">
                <span className="material-symbols-outlined text-2xl text-primary">{feature.icon}</span>
              </div>
              <h3 className="text-lg font-headline font-semibold text-on-surface mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
