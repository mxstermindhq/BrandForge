"use client";

const steps = [
  {
    number: "01",
    icon: "person_add",
    title: "Join",
    description: "Sign up with Google or email. Complete your profile. Choose whether you're hiring, selling expertise, or both.",
  },
  {
    number: "02",
    icon: "match_word",
    title: "Match",
    description: "Post a brief or browse specialists. The matching engine surfaces the best fit based on verified outcomes.",
  },
  {
    number: "03",
    icon: "chat",
    title: "Negotiate",
    description: "Review proposals. Counter terms. Generate contracts. Everything stays in one thread.",
  },
  {
    number: "04",
    icon: "account_balance",
    title: "Execute",
    description: "Funds sit in escrow. Milestones track progress. AI flags risk before it becomes a problem.",
  },
  {
    number: "05",
    icon: "military_tech",
    title: "Build your record",
    description: "Every closed deal strengthens your Index and your Chronicle — a portable, verified professional record.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-surface-container-low">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="section-label !mb-4">How It Works</p>
          <h2 className="text-3xl sm:text-4xl font-headline font-bold text-on-surface mb-4">
            From first message to final payment — in one thread.
          </h2>
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
            Five steps. No switching tools. No chasing signatures.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection line */}
          <div className="absolute left-8 top-12 bottom-12 w-px bg-gradient-to-b from-primary via-secondary to-tertiary hidden lg:block" />

          <div className="space-y-8">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="relative flex flex-col lg:flex-row gap-6 lg:gap-12 items-start"
              >
                {/* Number & Icon */}
                <div className="relative flex-shrink-0 flex items-center gap-4 lg:block">
                  <div className="w-16 h-16 rounded-xl bg-surface-container-high border-2 border-primary flex items-center justify-center lg:mb-4">
                    <span className="material-symbols-outlined text-2xl text-primary">{step.icon}</span>
                  </div>
                  <span className="text-4xl font-headline font-bold text-outline-variant lg:absolute lg:-left-4 lg:-top-4">
                    {step.number}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 surface-card lg:ml-8">
                  <h3 className="text-xl font-headline font-semibold text-on-surface mb-2">
                    {step.title}
                  </h3>
                  <p className="text-on-surface-variant leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
