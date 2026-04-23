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

/** Main navigation sections - HOTFIX: Deploy 2026-04-21 */
export const NAV: NavSection[] = [
  {
    section: null,
    items: [
      { label: "Feed", href: "/feed", materialIcon: "dynamic_feed", isAI: true, badge: 0 },
      { label: "Marketplace", href: "/marketplace", materialIcon: "storefront" },
      { label: "Leaderboard", href: "/leaderboard", materialIcon: "emoji_events" },
      { label: "Squads", href: "/squads", materialIcon: "groups" },
    ],
  },
];

/** Footer icons - smaller icons at bottom of sidebar */
export const NAV_FOOTER: NavItem[] = [
  { label: "Settings", href: "/settings", materialIcon: "settings" },
];
