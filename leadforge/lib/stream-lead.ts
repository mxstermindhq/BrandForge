import type { Lead, StreamLead } from "@/types";

function parseFitTags(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

export function leadToStreamLead(lead: Lead): StreamLead {
  return {
    ...lead,
    platform: lead.platform_source,
    name: lead.contact_name ?? "Unknown",
    title: lead.niche ?? "",
    company: lead.company_name ?? "",
    url: lead.website ?? "",
    fit_tags: parseFitTags(lead.fit_tags),
  };
}
