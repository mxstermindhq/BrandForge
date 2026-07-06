import type { BlogPost } from "../types";

const p = (paragraphs: string[]) => ({ paragraphs });

export const post: BlogPost = {
  slug: "discord-server-branding-for-growth",
  title: "How to brand your Discord server for growth",
  metaTitle: "Discord Server Branding for Growth | BrandForge",
  metaDescription:
    "Growth-focused Discord branding — banners, onboarding, role art, and launch assets that convert lurkers into members and paying tiers.",
  datePublished: "2026-06-10",
  readingTime: "11 min",
  category: "Discord",
  tags: ["discord", "branding", "community", "growth", "gaming"],
  ogImage: "/img/og-image.png",
  sections: [
    {
      heading: "Growth starts before invite links",
      ...p([
        "Members decide from the invite splash and server banner — not your rules channel. Growth branding means every public surface sells the same promise.",
        "Full setup guide: /blog/discord-server-branding-complete-guide/. Niche page: /for/gaming-server-owners/.",
      ]),
    },
    {
      heading: "Onboarding that converts lurkers",
      ...p([
        "Welcome bot + rules + one clear next step beat ten channels on day one. Role selection should gate content — not confuse it.",
        "Case study: /portfolio/drain-cx/ — gaming tools storefront with Discord integration.",
      ]),
    },
    {
      heading: "Role hierarchy as visual system",
      ...p([
        "Staff, VIP, and member roles need distinct colors that work on mobile. Avoid neon-on-neon — readability beats flair in member lists.",
        "Our /services/discord-branding/ covers icon, banner, and role art systems.",
      ]),
    },
    {
      heading: "Launch week announcement pack",
      ...p([
        "Pre-write partner posts, staff scripts, and milestone graphics before opening doors. Launch chaos kills first impressions.",
        "Short-form clips from /services/social-media/ amplify Discord invites on TikTok and X.",
      ]),
    },
    {
      heading: "Paid tier presentation",
      ...p([
        "If you monetize, paid role benefits must be visible in channel list and pinned FAQ — not buried in a PDF.",
        "Blueprint + Discord kit fits most communities under 5k members; larger stacks quoted on Discord.",
      ]),
    },
    {
      heading: "Cross-platform consistency",
      ...p([
        "Same avatar on Discord, X, and your lander. Mismatched GFX reads as amateur — especially for gaming and FiveM servers.",
        "Export aspect-safe banners for each platform from one brand file.",
      ]),
    },
    {
      heading: "Bots that reinforce brand",
      ...p([
        "Ticket bots, welcome flows, and status embeds should use your colors and voice — not default Discord blue.",
        "Tier 4 AI & Community retainer covers custom bots + server branding monthly.",
      ]),
    },
    {
      heading: "Measure growth without vanity metrics",
      ...p([
        "Track invite conversion, 7-day retention, and paid tier uptake — not raw join count from raid servers.",
        "Message BrandForge on Discord with member count and deadline for a fixed quote.",
      ]),
    },
  ],
  relatedServices: [
    { label: "Discord branding", href: "/services/discord-branding/" },
    { label: "Social media", href: "/services/social-media/" },
  ],
  relatedPortfolio: ["carspotlive", "drain-cx"],
  relatedNiches: ["gaming-server-owners", "content-creators"],
  faqs: [
    {
      question: "Can BrandForge rebrand an existing server?",
      answer: "Yes — share member count, games, and deadline on Discord for a quote.",
    },
    {
      question: "Do you run moderation?",
      answer: "We ship assets and bots — moderation stays yours unless automation is scoped.",
    },
    {
      question: "FiveM / Minecraft specific?",
      answer: "GFX and web work across gaming niches — send reference servers.",
    },
    {
      question: "Fastest package for Discord growth?",
      answer: "Blueprint + Discord branding add-on — typically 10–14 days.",
    },
  ],
};
