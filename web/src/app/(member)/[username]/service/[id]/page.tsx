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
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Link href={profilePath(ownerUsername)} className="text-sm text-primary hover:underline">
        ← {ownerUsername}
      </Link>
      <p className="section-label mt-6">{category}</p>
      <h1 className="font-headline text-3xl font-bold text-on-surface">{title}</h1>
      <p className="mt-2 text-2xl font-bold text-primary">${price.toLocaleString()}</p>
      {description ? <p className="mt-6 whitespace-pre-wrap text-on-surface-variant leading-relaxed">{description}</p> : null}
      <div className="mt-8 flex flex-wrap gap-3">
        <a href={tg} target="_blank" rel="noopener noreferrer" className="btn-primary min-h-11">
          Book via Telegram
        </a>
        <a
          href={CONTACT.discord}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary min-h-11"
        >
          Discord
        </a>
      </div>
      <p className="mt-6 text-xs text-on-surface-variant">Managed by {CONTACT.guarantor}</p>
    </div>
  );
}
