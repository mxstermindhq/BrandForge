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
      { label: "Chat", href: "/chat", materialIcon: "chat" },
      { label: "Marketplace", href: "/marketplace", materialIcon: "storefront" },
      { label: "Leaderboard", href: "/leaderboard", materialIcon: "emoji_events" },
    ],
  },
];

/** Footer icons - smaller icons at bottom of sidebar */
export const NAV_FOOTER: NavItem[] = [
  { label: "Settings", href: "/settings", materialIcon: "settings" },
];
