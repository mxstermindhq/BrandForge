import { metadataApiBase } from "@/lib/metadata-api";
import { normalizeServiceDetail, type ServiceDetail } from "@/lib/service-types";

export async function fetchServiceById(id: string): Promise<ServiceDetail | null> {
  const base = metadataApiBase();
  const res = await fetch(`${base}/api/services/${encodeURIComponent(id)}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return null;
  const j = (await res.json()) as { service?: Record<string, unknown> };
  if (!j.service) return null;
  return normalizeServiceDetail(j.service);
}
