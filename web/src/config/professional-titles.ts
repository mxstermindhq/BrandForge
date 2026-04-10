/**
 * Curated professional titles — keep in sync with `src/server/professional-titles.js`.
 */
export const PROFESSIONAL_TITLES = [
  "Product designer",
  "UX / UI designer",
  "Software engineer",
  "Full-stack developer",
  "Frontend developer",
  "Backend developer",
  "Mobile developer",
  "Data scientist",
  "ML / AI engineer",
  "DevOps / SRE",
  "Product manager",
  "Project manager",
  "Technical writer",
  "Marketing strategist",
  "Brand designer",
  "Video / motion designer",
  "Founder / executive",
  "Consultant",
  "Other specialist",
] as const;

export type ProfessionalTitle = (typeof PROFESSIONAL_TITLES)[number];

export function isProfessionalTitle(s: string): boolean {
  const k = String(s || "").trim().toLowerCase();
  if (!k) return false;
  return PROFESSIONAL_TITLES.some((t) => t.toLowerCase() === k);
}
