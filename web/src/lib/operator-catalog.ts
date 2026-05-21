import "server-only";

import { OPERATOR_MEDIA, type OperatorService } from "@/content/operator-media";
import type { CuratedOperator } from "@/lib/schemas/operator.schema";
import { getLandingOperators } from "@/lib/operators.server";

export type FoundService = {
  service: OperatorService;
  operator: CuratedOperator;
};

export async function findServiceById(id: string): Promise<FoundService | null> {
  const slug = String(id || "").trim();
  if (!slug) return null;
  const operators = await getLandingOperators();
  for (const operator of operators) {
    const media = OPERATOR_MEDIA[operator.username.toLowerCase()];
    if (!media) continue;
    const match = media.services.find((s) => s.id === slug);
    if (match) return { service: match, operator };
  }
  return null;
}

export async function listCatalogPaths(): Promise<{
  offers: { id: string; username: string }[];
  work: { username: string; pieceIds: string[] }[];
}> {
  const operators = await getLandingOperators();
  const offers: { id: string; username: string }[] = [];
  const work: { username: string; pieceIds: string[] }[] = [];
  for (const op of operators) {
    const media = OPERATOR_MEDIA[op.username.toLowerCase()];
    if (!media) continue;
    for (const s of media.services) {
      offers.push({ id: s.id, username: op.username });
    }
    work.push({
      username: op.username,
      pieceIds: media.workPieces.map((p) => p.id),
    });
  }
  return { offers, work };
}
