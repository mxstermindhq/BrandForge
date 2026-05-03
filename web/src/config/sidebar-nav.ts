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
      { label: "Chat", href: "/chat", materialIcon: "chat" },
    ],
  },
  {
    section: "Marketplace",
    items: [
      { label: "Browse", href: "/marketplace", materialIcon: "storefront" },
    ],
  },
  {
    section: "Community",
    items: [
      { label: "Leaderboard", href: "/leaderboard", materialIcon: "leaderboard" },
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
];

/** Footer icons - smaller icons at bottom of sidebar */
export const NAV_FOOTER: NavItem[] = [
  { label: "Settings", href: "/settings", materialIcon: "settings" },
];
