import type { NextRequest } from "next/server";
import { getLeadsByUser } from "@/lib/db";
import { CSV_PAGE_SIZE } from "@/lib/constants";
import { handleError } from "@/lib/http";
import { authed } from "@/lib/route-helpers";
import { parseLeadFilters } from "@/lib/lead-filters";
import type { Lead } from "@/types";

const COLUMNS = [
  "id",
  "type",
  "company_name",
  "contact_name",
  "email",
  "phone",
  "website",
  "linkedin_url",
  "instagram_url",
  "location",
  "niche",
  "score",
  "fit_label",
  "status",
  "pitch_angle",
  "likely_needs",
  "platform_source",
  "campaign_id",
  "created_at",
] as const;

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function rowFor(lead: Lead): string {
  let needs = "";
  if (lead.likely_needs) {
    try {
      needs = (JSON.parse(lead.likely_needs) as string[]).join("; ");
    } catch {
      needs = lead.likely_needs;
    }
  }
  const values: Record<(typeof COLUMNS)[number], unknown> = {
    id: lead.id,
    type: "", // resolved per-row would require a join; left blank in stream export
    company_name: lead.company_name,
    contact_name: lead.contact_name,
    email: lead.email,
    phone: lead.phone,
    website: lead.website,
    linkedin_url: lead.linkedin_url,
    instagram_url: lead.instagram_url,
    location: lead.location,
    niche: lead.niche,
    score: lead.score,
    fit_label: lead.fit_label,
    status: lead.status,
    pitch_angle: lead.pitch_angle,
    likely_needs: needs,
    platform_source: lead.platform_source,
    campaign_id: lead.campaign_id,
    created_at: lead.created_at,
  };
  return COLUMNS.map((c) => csvCell(values[c])).join(",");
}

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const { env, session } = await authed(request);
    const url = new URL(request.url);
    const filters = parseLeadFilters(url);
    const encoder = new TextEncoder();
    const date = new Date().toISOString().slice(0, 10);

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        controller.enqueue(encoder.encode(`${COLUMNS.join(",")}\n`));
        let page = 1;
        // Cursor pagination — never loads all leads into memory at once.
        for (;;) {
          const result = await getLeadsByUser(
            env.DB,
            session.userId,
            filters,
            page,
            CSV_PAGE_SIZE,
          );
          for (const lead of result.items) {
            controller.enqueue(encoder.encode(`${rowFor(lead)}\n`));
          }
          if (page >= result.totalPages || result.items.length === 0) break;
          page += 1;
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="leadforge-export-${date}.csv"`,
      },
    });
  } catch (err) {
    return handleError(err);
  }
}
