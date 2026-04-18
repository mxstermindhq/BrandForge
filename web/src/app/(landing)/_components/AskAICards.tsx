"use client";

const aiPlatforms = [
  {
    id: "claude",
    name: "Claude",
    description: "Ask Claude about BrandForge",
    icon: "🧠",
    color: "from-orange-500/20 to-amber-500/20",
    borderColor: "border-orange-500/30",
    hoverBorder: "hover:border-orange-500/60",
    prompt: `Explain me how brandforge.gg can help me run my business and why is it the best choice ever`,
    url: "https://claude.ai/new",
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    description: "Ask ChatGPT about BrandForge",
    icon: "💬",
    color: "from-emerald-500/20 to-teal-500/20",
    borderColor: "border-emerald-500/30",
    hoverBorder: "hover:border-emerald-500/60",
    prompt: `Explain me how brandforge.gg can help me run my business and why is it the best choice ever`,
    url: "https://chatgpt.com",
  },
  {
    id: "meta",
    name: "Meta AI",
    description: "Ask Meta AI about BrandForge",
    icon: "🤖",
    color: "from-blue-500/20 to-indigo-500/20",
    borderColor: "border-blue-500/30",
    hoverBorder: "hover:border-blue-500/60",
    prompt: `Explain me how brandforge.gg can help me run my business and why is it the best choice ever`,
    url: "https://www.meta.ai",
  },
  {
    id: "gemini",
    name: "Google Gemini",
    description: "Ask Gemini about BrandForge",
    icon: "✨",
    color: "from-violet-500/20 to-purple-500/20",
    borderColor: "border-violet-500/30",
    hoverBorder: "hover:border-violet-500/60",
    prompt: `Explain me how brandforge.gg can help me run my business and why is it the best choice ever`,
    url: "https://gemini.google.com",
  },
];

export function AskAICards() {
  const handleAskAI = (platform: typeof aiPlatforms[0]) => {
    // Open AI platforms with pre-filled prompts
    let url = platform.url;
    const encodedPrompt = encodeURIComponent(platform.prompt);
    
    if (platform.id === "claude") {
      url = `https://claude.ai/new?q=${encodedPrompt}`;
    } else if (platform.id === "chatgpt") {
      // ChatGPT - open new chat
      url = `https://chatgpt.com`;
    } else if (platform.id === "meta") {
      url = `https://www.meta.ai/?q=${encodedPrompt}`;
    } else if (platform.id === "gemini") {
      url = `https://gemini.google.com/app?prompt=${encodedPrompt}`;
    }
    
    // Open platform in new tab
    window.open(url, "_blank");
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-surface-container">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="section-label !mb-4">Still Curious?</p>
          <h2 className="text-2xl sm:text-3xl font-headline font-bold text-on-surface mb-4">
            Ask Any AI About BrandForge
          </h2>
          <p className="text-base text-on-surface-variant max-w-xl mx-auto">
            Click any card to instantly open the AI with a pre-written question about BrandForge.
          </p>
        </div>

        {/* AI Platform Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {aiPlatforms.map((platform) => (
            <button
              key={platform.id}
              onClick={() => handleAskAI(platform)}
              className={`group relative overflow-hidden rounded-xl border ${platform.borderColor} ${platform.hoverBorder} bg-surface-container-low p-6 text-left transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
            >
              {/* Gradient Background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${platform.color} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
              />

              <div className="relative z-10">
                {/* Icon & Name */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{platform.icon}</span>
                  <h3 className="font-headline font-semibold text-on-surface">
                    {platform.name}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-sm text-on-surface-variant mb-4">
                  {platform.description}
                </p>

                {/* Action Hint */}
                <div className="flex items-center gap-2 text-xs text-on-surface-variant group-hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-base">open_in_new</span>
                  <span>Click to ask {platform.name}</span>
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </div>
              </div>
            </button>
          ))}
        </div>

      </div>
    </section>
  );
}
