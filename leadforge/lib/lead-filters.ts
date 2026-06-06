import type { CampaignType, LeadFilters, LeadStatus } from "@/types";

const STATUSES: LeadStatus[] = ["new", "contacted", "qualified", "rejected"];

export function parseLeadFilters(url: URL): LeadFilters {
  const sp = url.searchParams;
  const statusParam = sp.get("status");
  const typeParam = sp.get("type");
  const sortByParam = sp.get("sortBy");
  const minScore = sp.get("minScore");

  return {
    campaignId: sp.get("campaignId") ?? undefined,
    type: typeParam === "b2b" || typeParam === "b2c" ? (typeParam as CampaignType) : undefined,
    status: statusParam && STATUSES.includes(statusParam as LeadStatus)
      ? (statusParam as LeadStatus)
      : undefined,
    platform: sp.get("platform") ?? undefined,
    q: sp.get("q") ?? undefined,
    minScore: minScore !== null && Number.isFinite(Number(minScore)) ? Number(minScore) : undefined,
    sortBy:
      sortByParam === "score" || sortByParam === "company_name" || sortByParam === "created_at"
        ? sortByParam
        : "created_at",
    sortDir: sp.get("sortDir") === "asc" ? "asc" : "desc",
  };
}
