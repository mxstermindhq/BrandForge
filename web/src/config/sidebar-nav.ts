export type NavItem = {
  label: string;
  href: string;
  /** Google Material Symbols ligature name */
  materialIcon: string;
};

export type NavSection = {
  section: string | null;
  items: NavItem[];
};

export const NAV: NavSection[] = [
  {
    section: null,
    items: [
      { label: "Home", href: "/", materialIcon: "home" },
      { label: "Chat", href: "/chat", materialIcon: "chat_bubble" },
      { label: "Services", href: "/services", materialIcon: "layers" },
      { label: "Requests", href: "/requests", materialIcon: "sync_alt" },
      { label: "Leaderboard", href: "/leaderboard", materialIcon: "leaderboard" },
      { label: "Store", href: "/store", materialIcon: "shopping_bag" },
    ],
  },
  {
    section: "Artificial Intelligence",
    items: [
      { label: "Agents", href: "/ai/agents", materialIcon: "smart_toy" },
      { label: "AI Chat", href: "/ai/chat", materialIcon: "auto_awesome" },
      { label: "Studio", href: "/studio", materialIcon: "architecture" },
    ],
  },
];
