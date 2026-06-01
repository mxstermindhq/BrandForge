/** Typed site configuration — replaces site/js/config.js BF_CONFIG */
export const SITE = {
  url: "https://brandforge.gg",
  discord: "https://discord.gg/a8Nz2R6M55",
  telegram: "https://t.me/Notmxstermind",
  premium: "https://mxstermind.com",
} as const;

export type PackageKey = "brand-sprint" | "launch-stack" | "growth-engine" | "custom";

export type PackageConfig = {
  label: string;
  discordMsg: string;
  telegramMsg: string;
};

export const PACKAGES: Record<PackageKey, PackageConfig> = {
  "brand-sprint": {
    label: "Brand Sprint",
    discordMsg:
      "Hi BrandForge — I'm interested in Brand Sprint ($500–$1,200).\n\nProject: \nDeadline: \nReferences: ",
    telegramMsg:
      "Hi BrandForge — I'm interested in Brand Sprint ($500–$1,200). Project: [describe]. Deadline: [date].",
  },
  "launch-stack": {
    label: "Launch Stack",
    discordMsg:
      "Hi BrandForge — I'm interested in Launch Stack ($2,500–$7,500).\n\nProject: \nPages/features needed: \nDeadline: \nEscrow: yes/no",
    telegramMsg:
      "Hi BrandForge — I'm interested in Launch Stack ($2,500–$7,500). Project: [describe]. Deadline: [date].",
  },
  "growth-engine": {
    label: "Growth Engine",
    discordMsg:
      "Hi BrandForge — I'd like to apply for Growth Engine ($3,500/mo).\n\nWhat I need monthly: \nCurrent site/product: \nStart date: ",
    telegramMsg:
      "Hi BrandForge — I'd like to apply for Growth Engine ($3,500/mo). Monthly needs: [describe].",
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
