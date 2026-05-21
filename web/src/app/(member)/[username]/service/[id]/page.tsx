import Link from "next/link";
import { notFound } from "next/navigation";
import { CONTACT, contactMessage } from "@/content/landing-directory";
import { isReservedUsername, profilePath } from "@/lib/reserved-paths";
import { metadataApiBase } from "@/lib/metadata-api";

async function fetchService(id: string) {
  const base = metadataApiBase();
  const res = await fetch(`${base}/api/services/${encodeURIComponent(id)}`, {
    next: { revalidate: 120 },
  });
  if (!res.ok) return null;
  const j = (await res.json()) as { service?: Record<string, unknown> };
  return j.service || null;
}

export default async function MemberServicePage({
  params,
}: {
  params: Promise<{ username: string; id: string }>;
}) {
  const { username, id } = await params;
  if (isReservedUsername(username)) notFound();

  const service = await fetchService(id);
  if (!service) notFound();

  const ownerUsername = String(
    (service.owner as { username?: string } | undefined)?.username || username,
  ).replace(/^@+/, "");
  const title = String(service.title || "Service");
  const price = Number(service.base_price) || 0;
  const category = String(service.category || "");
  const description = String(service.description || "");
  const tg = contactMessage(`Service: ${title} — @${ownerUsername}`);

  return (
    <main className="forge-page">
      <div className="forge-container forge-page-inner forge-page-inner-narrow">
        <Link href={profilePath(ownerUsername)} className="forge-back-link">
          ← {ownerUsername}
        </Link>
        <p className="forge-section-eyebrow forge-page-eyebrow">{category}</p>
        <h1 className="forge-section-title forge-page-title">{title}</h1>
        <p className="mt-2 font-headline text-3xl font-semibold text-[var(--forge-gold)]">${price.toLocaleString()}</p>
        {description ? (
          <p className="forge-page-body mt-6 whitespace-pre-wrap leading-relaxed text-[var(--forge-text-muted)]">
            {description}
          </p>
        ) : null}
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={tg} target="_blank" rel="noopener noreferrer" className="forge-btn forge-btn-primary min-h-11">
            Book via Telegram
          </a>
          <a href={CONTACT.discord} target="_blank" rel="noopener noreferrer" className="forge-btn forge-btn-secondary min-h-11">
            Discord
          </a>
        </div>
        <p className="mt-6 text-xs text-[var(--forge-text-muted)]">Managed by {CONTACT.guarantor}</p>
      </div>
    </main>
  );
}
