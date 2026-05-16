import Link from "next/link";
import { notFound } from "next/navigation";
import { CONTACT, contactMessage } from "@/content/landing-directory";
import { isReservedUsername, profilePath } from "@/lib/reserved-paths";
import { metadataApiBase } from "@/lib/metadata-api";

async function fetchRequest(id: string) {
  const base = metadataApiBase();
  const res = await fetch(`${base}/api/requests/${encodeURIComponent(id)}`, {
    next: { revalidate: 120 },
  });
  if (!res.ok) return null;
  const j = (await res.json()) as { request?: Record<string, unknown> };
  return j.request || null;
}

export default async function MemberRequestPage({
  params,
}: {
  params: Promise<{ username: string; id: string }>;
}) {
  const { username, id } = await params;
  if (isReservedUsername(username)) notFound();

  const request = await fetchRequest(id);
  if (!request) notFound();

  const title = String(request.title || "Request");
  const description = String(request.description || request.desc || "");
  const budgetMin = request.budget_min != null ? Number(request.budget_min) : null;
  const budgetMax = request.budget_max != null ? Number(request.budget_max) : null;
  const tg = contactMessage(`Request: ${title} — @${username}`);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Link href={profilePath(username)} className="text-sm text-primary hover:underline">
        ← {username}
      </Link>
      <p className="section-label mt-6">Open request</p>
      <h1 className="font-headline text-3xl font-bold text-on-surface">{title}</h1>
      <p className="mt-2 text-on-surface-variant">
        Budget:{" "}
        {budgetMin != null && budgetMax != null
          ? `$${budgetMin.toLocaleString()}–$${budgetMax.toLocaleString()}`
          : budgetMin != null
            ? `$${budgetMin.toLocaleString()}+`
            : "Open"}
      </p>
      {description ? <p className="mt-6 whitespace-pre-wrap text-on-surface-variant leading-relaxed">{description}</p> : null}
      <div className="mt-8 flex flex-wrap gap-3">
        <a href={tg} target="_blank" rel="noopener noreferrer" className="btn-primary min-h-11">
          Apply via Telegram
        </a>
        <a href={CONTACT.discord} target="_blank" rel="noopener noreferrer" className="btn-secondary min-h-11">
          Discord
        </a>
      </div>
      <p className="mt-6 text-xs text-on-surface-variant">Managed by {CONTACT.guarantor}</p>
    </div>
  );
}
