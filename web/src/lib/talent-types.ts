import type { TalentCategory } from "@/content/landing-directory";

export type TalentAvailability = "available" | "limited" | "waitlist";

export type TalentServiceSummary = {
  id: string;
  title: string;
  category: string;
  price: number;
  slug: string | null;
};

export type TalentMember = {
  id: string;
  username: string;
  name: string;
  role: string;
  category: Exclude<TalentCategory, "All">;
  yearsExp: number;
  memberSince: string | null;
  tools: string[];
  preferences: string[];
  rateLabel: string;
  availability: TalentAvailability;
  highlight: string | null;
  avatarUrl: string | null;
  location: string | null;
  topMember: boolean;
  rating: number | null;
  jobs: number;
  services: TalentServiceSummary[];
  profileUrl: string;
};

export type TalentDirectoryResponse = {
  members: TalentMember[];
  total: number;
};

const ACCENTS = [
  "from-cyan-500/20 to-blue-600/10",
  "from-fuchsia-500/20 to-purple-600/10",
  "from-indigo-500/20 to-violet-600/10",
  "from-amber-500/20 to-orange-600/10",
  "from-emerald-500/20 to-teal-600/10",
  "from-rose-500/20 to-pink-600/10",
  "from-sky-500/20 to-blue-600/10",
  "from-lime-500/20 to-green-600/10",
  "from-violet-500/20 to-purple-600/10",
  "from-red-500/20 to-orange-600/10",
  "from-yellow-500/20 to-amber-600/10",
  "from-pink-500/20 to-fuchsia-600/10",
];

export function talentAccent(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return ACCENTS[Math.abs(h) % ACCENTS.length];
}

export function talentInitials(name: string): string {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function formatMemberSince(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}
