import type { NextRequest } from "next/server";
import { getLeadById, updateLead } from "@/lib/db";
import { fail, handleError, ok } from "@/lib/http";
import { authed } from "@/lib/route-helpers";
import type { LeadPatch, LeadStatus } from "@/types";

type Params = { params: Promise<{ id: string }> };

const STATUSES: LeadStatus[] = ["new", "contacted", "qualified", "rejected"];

export async function PATCH(request: NextRequest, { params }: Params): Promise<Response> {
  try {
    const { env, session } = await authed(request);
    const { id } = await params;

    const lead = await getLeadById(env.DB, id);
    if (!lead || lead.user_id !== session.userId) return fail(404, "Lead not found");

    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    const patch: LeadPatch = {};
    if (body?.status !== undefined) {
      if (!STATUSES.includes(body.status as LeadStatus)) {
        return fail(400, "Invalid status");
      }
      patch.status = body.status as LeadStatus;
    }
    if (body?.notes !== undefined) {
      patch.notes = String(body.notes);
    }

    const updated = await updateLead(env.DB, id, session.userId, patch);
    return ok(updated);
  } catch (err) {
    return handleError(err);
  }
}
