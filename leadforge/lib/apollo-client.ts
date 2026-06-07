import type { RawScrapedLead, ScraperBlueprint } from "@/types";

const APOLLO_SEARCH_URL = "https://api.apollo.io/api/v1/mixed_people/search";

interface ApolloPerson {
  first_name?: string;
  last_name?: string;
  title?: string;
  email?: string;
  linkedin_url?: string;
  twitter_url?: string;
  organization?: { name?: string };
  city?: string;
  state?: string;
  country?: string;
}

interface ApolloSearchResponse {
  people?: ApolloPerson[];
}

/** Apollo.io People Search → unified RawScrapedLead[]. */
export async function searchApolloPeople(
  blueprint: ScraperBlueprint,
  limit: number,
  apiKey: string,
): Promise<RawScrapedLead[]> {
  if (!apiKey.trim()) return [];

  const body = {
    page: 1,
    per_page: Math.min(Math.max(limit, 1), 25),
    person_titles: blueprint.titles.length ? blueprint.titles : undefined,
    q_keywords: blueprint.keywords.join(" ") || blueprint.industry || undefined,
    person_locations: blueprint.location ? [blueprint.location] : undefined,
    q_organization_keyword_tags: blueprint.industry ? [blueprint.industry] : undefined,
  };

  const res = await fetch(APOLLO_SEARCH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      "X-Api-Key": apiKey.trim(),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    console.warn(`[apollo] search failed: ${res.status}`);
    return [];
  }

  const json = (await res.json()) as ApolloSearchResponse;
  return (json.people ?? []).map((person) => mapApolloPerson(person)).filter((l) => l.name || l.email);
}

function mapApolloPerson(person: ApolloPerson): RawScrapedLead {
  const name = [person.first_name, person.last_name].filter(Boolean).join(" ").trim();
  const social_links: Record<string, string> = {};
  if (person.linkedin_url) social_links.linkedin = person.linkedin_url;
  if (person.twitter_url) social_links.twitter = person.twitter_url;

  const location = [person.city, person.state, person.country].filter(Boolean).join(", ");

  return {
    name: name || "Unknown",
    title: person.title?.trim() ?? "",
    company: person.organization?.name?.trim() ?? "",
    email: person.email?.trim().toLowerCase() ?? "",
    social_links,
    raw_bio_text: [person.title, person.organization?.name, location].filter(Boolean).join(" · "),
    platform: "linkedin",
  };
}
