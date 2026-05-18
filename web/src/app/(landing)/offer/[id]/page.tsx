import Link from "next/link";
import { notFound } from "next/navigation";
import { PACKAGES, contactMessage } from "@/content/landing-directory";

export default async function OfferDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const offer = PACKAGES.find((p) => p.id === id);
  if (!offer) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link href="/#talent" className="text-sm text-[var(--color-text-secondary)] hover:underline">
        ← Back
      </Link>
      <p className="mt-6 text-xs uppercase tracking-[0.1em] text-[var(--color-gold)]">{offer.target}</p>
      <h1 className="mt-1 text-3xl font-semibold text-[var(--color-text-primary)]">{offer.name}</h1>
      <p className="mt-2 text-lg font-semibold text-[var(--color-text-primary)]">{offer.price}</p>
      <p className="mt-3 text-[var(--color-text-secondary)]">{offer.tagline}</p>
      <ul className="mt-6 space-y-2">
        {offer.includes.map((item) => (
          <li key={item} className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
            {item}
          </li>
        ))}
      </ul>
      <div className="mt-8">
        <a
          href={contactMessage(`Interest in service: ${offer.name}`)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center rounded-lg px-4 text-sm font-semibold text-white"
          style={{ background: "var(--color-gold)" }}
        >
          Show interest via Telegram →
        </a>
      </div>
    </main>
  );
}
