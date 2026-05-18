import type { CuratedOperator } from "@/lib/schemas/operator.schema";
import type { TalentMember } from "@/lib/talent-types";

function cap(text: string, max: number): string {
  const clean = String(text || "").trim();
  if (!clean) return "";
  if (clean.length <= max) return clean;
  return `${clean.slice(0, Math.max(0, max - 1)).trim()}…`;
}

function inferAvailability(member: TalentMember): CuratedOperator["availability"] {
  if (member.availability === "limited") return "limited";
  if (member.availability === "waitlist") return "unavailable";
  if (member.topMember || member.jobs >= 3) return "available-now";
  return "available";
}

function inferLayoutSpan(member: TalentMember, index: number): CuratedOperator["layoutSpan"] {
  if (member.topMember) return "featured";
  if (index % 5 === 0) return "compact";
  return "standard";
}

export function mapTalentMemberToOperator(member: TalentMember, index: number): CuratedOperator {
  const scoreFromRating = member.rating != null ? Math.round((member.rating / 5) * 100) : 78;
  const jobBonus = Math.min(member.jobs * 2, 14);
  const amanahScore = Math.max(55, Math.min(99, scoreFromRating + jobBonus));
  const completionRate = Math.max(70, Math.min(99, 82 + Math.min(member.jobs, 12)));
  const skills = member.tools.slice(0, 6);
  const profileLink = member.profileUrl.startsWith("http") ? member.profileUrl : `https://brandforge.gg${member.profileUrl}`;

  return {
    username: member.username,
    name: member.name,
    role: cap(member.role || "Operator", 70) || "Operator",
    yearsExp: Math.max(0, Math.min(50, member.yearsExp || 0)),
    availability: inferAvailability(member),
    amanahScore,
    completionRate,
    bio: cap(member.highlight || "Profile being completed. Add your proof, rates, and skills to unlock full visibility.", 280),
    bestResult: cap(
      member.services[0]?.title
        ? `Delivered: ${member.services[0].title}`
        : member.jobs > 0
          ? `${member.jobs} completed project${member.jobs === 1 ? "" : "s"}`
          : "Ready for the first verified project.",
      140,
    ),
    wontTakeOn: cap("No vague scope, unclear ownership, or hidden requirements.", 140),
    startingPrice: cap(member.rateLabel || "Rate on request", 40),
    pricingModel: "Project-based",
    skills: skills.length ? skills : ["Profile", "being", "completed"],
    idealClient: cap(member.category || "Builders", 100),
    workStyle: cap(member.preferences.join(" · ") || "Remote collaboration", 100),
    typicalTimeline: cap(member.preferences.find((p) => /day|week|month/i.test(p)) || "Scope-based", 80),
    proofLink: profileLink,
    faq: [
      {
        question: "Are you currently open for work?",
        answer: `Status: ${member.availability}. Final scoping and intros are coordinated by mxstermind.`,
      },
      {
        question: "How should a project start?",
        answer: "Share scope, budget, and timeline first. Once fit is confirmed, you get a focused intro and next steps.",
      },
      {
        question: "What should I review first?",
        answer: member.services[0]?.title
          ? `Start with this published service: ${member.services[0].title}.`
          : "Start with profile bio, skills, and pricing details.",
      },
    ],
    isVerified: member.topMember || member.jobs > 0,
    layoutSpan: inferLayoutSpan(member, index),
    displayOrder: index + 1,
  };
}
