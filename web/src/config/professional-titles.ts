import professionalTitles from "../../../data/professional-titles.json";

export const PROFESSIONAL_TITLES = professionalTitles as readonly string[];

export type ProfessionalTitle = (typeof PROFESSIONAL_TITLES)[number];

export function isProfessionalTitle(s: string): boolean {
  const k = String(s || "").trim().toLowerCase();
  if (!k) return false;
  return PROFESSIONAL_TITLES.some((t) => t.toLowerCase() === k);
}
