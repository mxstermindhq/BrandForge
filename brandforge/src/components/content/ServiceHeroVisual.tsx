import { ProjectMockup, VisualStatCard } from "@/components/visual";
import type { ServiceSlug } from "@/content/hubs/services-hub";
import type { MockupType } from "@/types/portfolio";

type ServiceVisualConfig = {
  mockupType: MockupType;
  gradient: readonly [string, string];
  proofValue?: string;
  proofLabel?: string;
  caption: string;
};

const SERVICE_VISUALS: Record<ServiceSlug, ServiceVisualConfig> = {
  "brand-identity": {
    mockupType: "browser",
    gradient: ["#7c3aed", "#4c1d95"],
    proofValue: "◈",
    proofLabel: "Logo systems & guidelines",
    caption: "Identity that reads on Discord, web, and ads",
  },
  "web-design": {
    mockupType: "browser",
    gradient: ["#0ea5e9", "#0369a1"],
    proofValue: "97",
    proofLabel: "PageSpeed target on launches",
    caption: "Fast static or Next.js marketing sites",
  },
  "mobile-apps": {
    mockupType: "phone",
    gradient: ["#7c3aed", "#312e81"],
    proofValue: "App Store",
    proofLabel: "CarSpotLive shipped Dec 2024",
    caption: "Native iOS & Android — not wrapper landers",
  },
  "discord-branding": {
    mockupType: "browser",
    gradient: ["#5865f2", "#404eed"],
    proofValue: "24h",
    proofLabel: "Full server kits",
    caption: "Roles, banners, onboarding, GFX",
  },
  automation: {
    mockupType: "browser",
    gradient: ["#10b981", "#065f46"],
    proofValue: "n8n",
    proofLabel: "Workflows + custom bots",
    caption: "Discord, Telegram, scraping, ops",
  },
  "ai-tools": {
    mockupType: "browser",
    gradient: ["#8b5cf6", "#5b21b6"],
    proofValue: "AI",
    proofLabel: "Doc-grounded assistants",
    caption: "Support bots and operator tools",
  },
  "seo-growth": {
    mockupType: "browser",
    gradient: ["#f59e0b", "#b45309"],
    proofValue: "GEO",
    proofLabel: "FAQ + schema for AI citation",
    caption: "SEO and generative engine optimisation",
  },
  "paid-ads": {
    mockupType: "browser",
    gradient: ["#ef4444", "#991b1b"],
    proofValue: "ROAS",
    proofLabel: "Landing + creative alignment",
    caption: "Meta, Google, short-form hooks",
  },
  "social-media": {
    mockupType: "tablet",
    gradient: ["#ec4899", "#9d174d"],
    proofValue: "3mo",
    proofLabel: "Content retainers",
    caption: "Short-form, carousels, brand templates",
  },
};

type ServiceHeroVisualProps = {
  slug: ServiceSlug;
};

export function ServiceHeroVisual({ slug }: ServiceHeroVisualProps): React.JSX.Element {
  const config = SERVICE_VISUALS[slug];

  return (
    <section className="border-b border-b1 bg-s1 py-12">
      <div className="content-wrap grid items-center gap-10 lg:grid-cols-2">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-bright">Proof</p>
          <p className="mt-3 text-sm text-text-secondary">{config.caption}</p>
          {config.proofValue && config.proofLabel ? (
            <div className="mt-6 max-w-xs">
              <VisualStatCard value={config.proofValue} label={config.proofLabel} />
            </div>
          ) : null}
        </div>
        <ProjectMockup
          type={config.mockupType}
          projectName={config.proofLabel ?? slug}
          gradientFrom={config.gradient[0]}
          gradientTo={config.gradient[1]}
        />
      </div>
    </section>
  );
}
