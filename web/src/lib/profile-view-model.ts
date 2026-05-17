import type { CuratedOperator } from "@/lib/schemas/operator.schema";
import { talentInitials } from "@/lib/talent-types";

export interface ProfileViewModel {
  username: string;
  name: string;
  initials: string;
  role: string;
  yearsExp: number;
  availability: "available-now" | "available" | "limited" | "unavailable";
  amanahScore: number;
  completionRate: number;
  bio: string;
  bestResult: string;
  wontTakeOn: string;
  startingPrice: string;
  pricingModel: string;
  skills: string[];
  idealClient: string;
  workStyle: string;
  typicalTimeline: string;
  proofLink: string;
  faq: Array<{ question: string; answer: string }>;
  isVerified: boolean;
  isCurated: boolean;
}

function normalizeAvailability(v: string | null | undefined): ProfileViewModel["availability"] {
  const n = String(v || "").toLowerCase();
  if (n === "available-now") return "available-now";
  if (n === "available") return "available";
  if (n === "limited" || n === "busy") return "limited";
  if (n === "unavailable") return "unavailable";
  return "available";
}

function fallbackFaq(vm: Omit<ProfileViewModel, "faq">): Array<{ question: string; answer: string }> {
  return [
    {
      question: "What's the best way to work with you?",
      answer: `${vm.workStyle}. Engagement model: ${vm.pricingModel}. Typical timeline: ${vm.typicalTimeline}.`,
    },
    {
      question: "What does a typical project look like?",
      answer: `${vm.idealClient}. ${vm.bio}`,
    },
    {
      question: `What makes you different from other ${vm.role}s?`,
      answer: `${vm.bestResult} Core strengths: ${vm.skills.join(", ")}.`,
    },
  ];
}

export function mapCuratedOperatorToViewModel(op: CuratedOperator): ProfileViewModel {
  const base: Omit<ProfileViewModel, "faq"> = {
    username: op.username,
    name: op.name,
    initials: talentInitials(op.name),
    role: op.role,
    yearsExp: op.yearsExp,
    availability: op.availability,
    amanahScore: op.amanahScore,
    completionRate: op.completionRate,
    bio: op.bio,
    bestResult: op.bestResult,
    wontTakeOn: op.wontTakeOn,
    startingPrice: op.startingPrice,
    pricingModel: op.pricingModel,
    skills: op.skills,
    idealClient: op.idealClient,
    workStyle: op.workStyle,
    typicalTimeline: op.typicalTimeline,
    proofLink: op.proofLink || `https://brandforge.gg/${encodeURIComponent(op.username)}`,
    isVerified: op.isVerified,
    isCurated: true,
  };
  return { ...base, faq: op.faq.length > 0 ? op.faq : fallbackFaq(base) };
}

type ApiProfileInput = {
  username?: string | null;
  full_name?: string | null;
  headline?: string | null;
  bio?: string | null;
  availability?: string | null;
  rate_label?: string | null;
  min_budget?: number | null;
  skills?: string[] | null;
  open_to_offers?: boolean | null;
  openRequests?: Array<{ title?: string | null }> | null;
};

export function mapApiProfileToViewModel(profile: ApiProfileInput): ProfileViewModel {
  const username = String(profile.username || "").replace(/^@+/, "") || "member";
  const name = profile.full_name?.trim() || username;
  const skills = Array.isArray(profile.skills) ? profile.skills.filter(Boolean).slice(0, 6) : [];
  const base: Omit<ProfileViewModel, "faq"> = {
    username,
    name,
    initials: talentInitials(name),
    role: profile.headline?.trim() || "Operator",
    yearsExp: 0,
    availability: normalizeAvailability(profile.availability),
    amanahScore: 90,
    completionRate: 92,
    bio: profile.bio?.trim() || "Profile is being completed.",
    bestResult: "Delivery aligned to scope and communication quality.",
    wontTakeOn: "Projects without scope clarity or decision ownership.",
    startingPrice: profile.rate_label?.trim() || (profile.min_budget ? `From EUR ${profile.min_budget}` : "Rate on request"),
    pricingModel: profile.open_to_offers ? "Flexible engagement" : "Scoped engagement",
    skills: skills.length > 0 ? skills : ["Execution", "Communication", "Delivery"],
    idealClient: "Teams with clear outcomes and fast feedback",
    workStyle: "Transparent checkpoints and milestone-based delivery",
    typicalTimeline: "1-4 weeks",
    proofLink: `https://brandforge.gg/${encodeURIComponent(username)}`,
    isVerified: false,
    isCurated: false,
  };
  return { ...base, faq: fallbackFaq(base) };
}
