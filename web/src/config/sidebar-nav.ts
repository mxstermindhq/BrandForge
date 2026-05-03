export type NavItem = {
  label: string;
  href: string;
  /** Google Material Symbols ligature name */
  materialIcon: string;
  /** Optional badge count for items like inbox */
  badge?: number;
  /** For merged items, show AI indicator */
  isAI?: boolean;
};

export type NavSection = {
  section: string | null;
  items: NavItem[];
};

/** Main navigation sections */
export const NAV: NavSection[] = [
  {
    section: null,
    items: [
      { label: "Home", href: "/dashboard", materialIcon: "home" },
      { label: "Feed", href: "/feed", materialIcon: "feed" },
      { label: "Chat", href: "/chat", materialIcon: "chat" },
    ],
  },
  {
    section: "Marketplace",
    items: [
      { label: "Browse", href: "/marketplace", materialIcon: "storefront" },
      { label: "Smart Match", href: "/marketplace?tab=smart-match", materialIcon: "smart_toy" },
    ],
  },
  {
    section: "AI Tools",
    items: [
      { label: "AI Hub", href: "/ai", materialIcon: "psychology" },
      { label: "Brief Generator", href: "/ai/brief-generator", materialIcon: "description" },
      { label: "Proposal Writer", href: "/ai/proposal-writer", materialIcon: "edit_document" },
      { label: "Career Assistant", href: "/ai/career-assistant", materialIcon: "school" },
    ],
  },
  {
    section: "Agents",
    items: [
      { label: "Agent Marketplace", href: "/agents/marketplace", materialIcon: "shopping_bag" },
      { label: "My Agents", href: "/agents", materialIcon: "android" },
      { label: "Agent Studio", href: "/agents/studio", materialIcon: "build" },
    ],
  },
  {
    section: null,
    items: [
      { label: "Leaderboard", href: "/leaderboard", materialIcon: "emoji_events" },
    ],
  },
];

/** Footer icons - smaller icons at bottom of sidebar */
export const NAV_FOOTER: NavItem[] = [
  { label: "Settings", href: "/settings", materialIcon: "settings" },
];
