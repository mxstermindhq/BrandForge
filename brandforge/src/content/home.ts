export type VouchItem = {
  id: string;
  from: string;
  stars: number;
  text: string;
  who: string;
  amount?: string;
  role?: string;
  portfolioSlug?: string;
  avatarInitial?: string;
};

export type StatItem = {
  value: string;
  label: string;
  icon?: string;
};

export const VOUCHES: readonly VouchItem[] = [
  {
    id: "zyllls",
    from: "Telegram · Feb 2025",
    stars: 5,
    text: "Amazing logos and graphics! $500+ in deals. Went smooth and easy.",
    who: "@zyllls",
    amount: "$500+ verified",
  },
  {
    id: "crum",
    from: "Discord · Jan 2026",
    stars: 4,
    text: "Very professional team, worked on 2 projects with me and had no issues besides slight delays, but were compensated accordingly. Backend work was very professional and overall 9/10 experience.",
    who: "@crum",
  },
  {
    id: "vizzy",
    from: "Discord · Jul 2025",
    stars: 5,
    text: "Very great team, got done multiple projects for me so far and im looking for more in the future, thanks for the latest one. Fast and reliable.",
    who: "@vizzy",
    amount: "$900 + $2,000+ verified projects",
    role: "Forum operator",
  },
  {
    id: "day",
    from: "Discord · Jan 2025",
    stars: 5,
    text: "$3k+ in dev work. Very professional, very kind and gets work done on time while maintaining quality.",
    who: "@day [WZ]",
    amount: "$3,000+ verified spend",
  },
  {
    id: "clippy",
    from: "Discord · Mar 2025",
    stars: 5,
    text: "Came through on a tight overnight deadline and had everything ready by morning. Identified and solved problems I didn't even know about. He's the POC for dev work now.",
    who: "@ClippyCult",
  },
  {
    id: "can",
    from: "Discord · Aug 2025",
    stars: 5,
    text: "Designs are not from this world. Such a good guy with so much heart and passion. I just can recommend him.",
    who: "@Can",
    role: "Store owner",
    portfolioSlug: "drain-cx",
  },
  {
    id: "omballa",
    from: "Discord · Jul 2025",
    stars: 5,
    text: "Working with the Brandforge team has been extremely sensational. I am truly amazed at the motion graphics given to me by their designer and the detail put into this work.",
    who: "@Omballa",
  },
] as const;
