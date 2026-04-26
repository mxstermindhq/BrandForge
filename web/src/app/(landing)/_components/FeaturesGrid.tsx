"use client";

const features = [
  {
    icon: "smart_toy",
    title: "AI Copilot",
    description: "A copilot that knows your deals, your rates, and your voice. Drafts replies, summarizes threads, flags risk — you approve everything that leaves the room.",
  },
  {
    icon: "description",
    title: "Contracts in one click",
    description: "Generate enforceable contracts from your agreed terms. Clause-level review, clean redlines, e-signatures built in.",
  },
  {
    icon: "account_balance",
    title: "Escrow & milestones",
    description: "Funds held the moment you sign. Released on milestone approval. Both sides protected end-to-end.",
  },
  {
    icon: "match_word",
    title: "Smart matching",
    description: "Describe the scope in two sentences. Our matching engine surfaces the specialists most likely to close it — ranked by verified outcomes, not self-promotion.",
  },
  {
    icon: "mic",
    title: "Voice to brief",
    description: "Speak the project. Get a structured brief in seconds. Edit, approve, send.",
  },
  {
    icon: "edit_document",
    title: "Voice to proposal",
    description: "Dictate your approach and pricing. The platform writes the proposal in your voice.",
  },
  {
    icon: "military_tech",
    title: "The Ranking Index",
    description: "Your reputation, verified and portable. Built from deals closed on-platform — close rate, delivery reliability, client retention, review quality.",
  },
  {
    icon: "emoji_events",
    title: "Portable credentials",
    description: "Every completed deal adds to your Chronicle — a signed, exportable record of verified work you can share anywhere.",
  },
  {
    icon: "groups_2",
    title: "Human + AI teams",
    description: "Assemble specialists and AI agents into teams that execute full-scope projects. You stay in command. The team handles the rest.",
  },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="border-t border-outline-variant bg-background px-4 py-24 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="section-label !mb-4">Features</p>
          <h2 className="text-3xl sm:text-4xl font-headline font-bold text-on-surface mb-4">
            Built for the way you actually work
          </h2>
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
            Every deal — from first message to final invoice — lives in one place. AI drafts. You decide.
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
