import type { LaunchCampaign } from "@/content/launch/types";

type OutreachVariables = {
  niche: string;
  offer: string;
  platform?: string;
};

/** Build copy-paste outreach from campaign template + variables. */
export function generateOutreachCopy(
  campaign: Pick<LaunchCampaign, "theme" | "hook" | "keyMessages">,
  variables: OutreachVariables,
): string {
  const platformLine = variables.platform ? `\nPlatform: ${variables.platform}` : "";
  return [
    variables.offer,
    "",
    campaign.hook,
    "",
    `Theme: ${campaign.theme}`,
    `Niche: ${variables.niche}${platformLine}`,
    "",
    "Key messages:",
    ...campaign.keyMessages.map((m) => `• ${m}`),
    "",
    "→ brandforge.gg/packages",
    "→ discord.gg/a8Nz2R6M55",
  ].join("\n");
}

/** One line per platform for checklist copy buttons on /launch/. */
export function platformPostFromTemplate(
  campaign: Pick<LaunchCampaign, "hook" | "keyMessages">,
  platform: string,
  niche: string,
): string {
  return generateOutreachCopy(
    { theme: campaign.hook, hook: campaign.hook, keyMessages: campaign.keyMessages },
    { niche, offer: campaign.hook, platform },
  );
}
