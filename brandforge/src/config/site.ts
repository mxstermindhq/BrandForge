/** Typed site configuration — replaces site/js/config.js BF_CONFIG */
export const SITE = {
  url: "https://brandforge.gg",
  discord: "https://discord.gg/a8Nz2R6M55",
  telegram: "https://t.me/Notmxstermind",
  premium: "https://mxstermind.com",
  gaMeasurementId: "G-G3L5EBB195",
} as const;

export type PackageKey =
  | "blueprint"
  | "automator"
  | "mvp-engine"
  | "ai-community"
  | "full-stack-enterprise"
  | "custom";

export type PackageConfig = {
  label: string;
  discordMsg: string;
  telegramMsg: string;
};

export const PACKAGES: Record<PackageKey, PackageConfig> = {
  blueprint: {
    label: "The Blueprint",
    discordMsg:
      "Hi BrandForge — I'm interested in Tier 1: The Blueprint ($300–$500).\n\nProject: \nDeadline: \nReferences: ",
    telegramMsg:
      "Hi BrandForge — Tier 1: The Blueprint ($300–$500). Project: [describe]. Deadline: [date].",
  },
  automator: {
    label: "The Automator",
    discordMsg:
      "Hi BrandForge — I'm interested in Tier 2: The Automator ($1,500–$3,000/mo).\n\nWorkflows needed: \nTools (n8n/Make): \nStart date: ",
    telegramMsg:
      "Hi BrandForge — Tier 2: The Automator retainer. Monthly automation needs: [describe].",
  },
  "mvp-engine": {
    label: "The MVP Engine",
    discordMsg:
      "Hi BrandForge — I'm interested in Tier 3: The MVP Engine ($5,000/mo).\n\nProduct: \nFeatures this sprint: \nStart date: ",
    telegramMsg:
      "Hi BrandForge — Tier 3: The MVP Engine ($5,000/mo). Product scope: [describe].",
  },
  "ai-community": {
    label: "The AI & Community",
    discordMsg:
      "Hi BrandForge — I'm interested in Tier 4: AI & Community ($7,500/mo).\n\nAI / Discord / video needs: \nStart date: ",
    telegramMsg:
      "Hi BrandForge — Tier 4: AI & Community ($7,500/mo). Scope: [describe].",
  },
  "full-stack-enterprise": {
    label: "The Full-Stack Powerhouse",
    discordMsg:
      "Hi BrandForge — I'm interested in Tier 5: Full-Stack Powerhouse ($10,000+/mo).\n\nStreams needed (Design/Dev/Growth): \nStart date: ",
    telegramMsg:
      "Hi BrandForge — Tier 5: Full-Stack Powerhouse ($10,000+/mo). Scope: [describe].",
  },
  custom: {
    label: "Custom quote",
    discordMsg:
      "Hi BrandForge — I need a quote.\n\nPackage (if known): \nProject: \nDeadline: \nPayment: crypto / escrow\nReferences: ",
    telegramMsg:
      "Hi BrandForge — I need a quote. Project: [describe]. Deadline: [date]. Payment: crypto or escrow.",
  },
};

export function telegramUrl(message: string): string {
  const base = SITE.telegram;
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}text=${encodeURIComponent(message)}`;
}
