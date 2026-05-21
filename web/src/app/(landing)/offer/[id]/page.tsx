import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { contactMessage } from "@/content/landing-directory";
import { StickyConversationCTA } from "@/components/directory/StickyConversationCTA";
import { findServiceById } from "@/lib/operator-catalog";
import { serviceJsonLd } from "@/lib/json-ld";

export default async function OfferDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const found = await findServiceById(id);
  if (!found) notFound();
  const { service, operator } = found;
  const tgSubject = `Service inquiry: ${service.name} (${operator.name})`;
  const jsonLd = serviceJsonLd(service, operator);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 pb-28 sm:px-6 sm:pb-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Link href="/#talent" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-gold)]">
        ← Directory
      </Link>

      <article
        className="mt-6 overflow-hidden rounded-3xl border bg-[var(--color-surface)]"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="relative h-64 w-full overflow-hidden sm:h-80">
          <Image
            src={service.image}
            alt={service.name}
            fill
            sizes="(max-width: 768px) 100vw, 1100px"
            className="object-cover"
            priority
          />
          <span
            className="absolute left-4 top-4 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] backdrop-blur"
            style={{ background: "color-mix(in srgb, white 82%, transparent)", color: "var(--color-gold)" }}
          >
            Scoped service
          </span>
        </div>

        <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1.35fr_0.65fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.1em] text-[var(--color-text-secondary)]">
              Operator{" "}
              <Link href={`/${encodeURIComponent(operator.username)}`} className="text-[var(--color-gold)] hover:underline">
                {operator.name}
              </Link>
            </p>
            <h1 className="mt-2 font-headline text-4xl font-semibold text-[var(--color-text-primary)]">{service.name}</h1>
            <p className="mt-4 text-base leading-relaxed text-[var(--color-text-secondary)]">{service.tagline}</p>

            <h2 className="mt-8 text-sm font-semibold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">
              What&apos;s included
            </h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {service.bullets.map((bullet) => (
                <li
                  key={bullet}
                  className="rounded-xl border px-3 py-2.5 text-sm text-[var(--color-text-secondary)]"
                  style={{ borderColor: "var(--color-border)", background: "var(--color-surface-2)" }}
                >
                  <span className="mr-2 text-[var(--color-gold)]">✓</span>
                  {bullet}
                </li>
              ))}
            </ul>
          </div>

          <aside className="offer-sticky-panel">
            <div
              className="rounded-2xl border p-6"
              style={{ borderColor: "var(--color-gold-border)", background: "var(--color-gold-subtle)" }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-gold)]">Starting from</p>
              <p className="mt-2 font-headline text-4xl font-semibold text-[var(--color-text-primary)]">{service.price}</p>
              <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
                mxstermind confirms scope and fit before any payment. No bidding, no surprise fees.
              </p>
              <a
                href={contactMessage(tgSubject)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary mt-6 flex min-h-12 w-full items-center justify-center text-sm"
                data-track="offer_primary_cta"
              >
                Start conversation about this service →
              </a>
              <Link
                href={`/${encodeURIComponent(operator.username)}`}
                className="mt-3 flex min-h-11 w-full items-center justify-center rounded-xl border text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-gold-border)]"
                style={{ borderColor: "var(--color-border)" }}
                data-track="offer_profile_link"
              >
                View {operator.name}&apos;s profile
              </Link>
            </div>
          </aside>
        </div>
      </article>

      <StickyConversationCTA
        subject={tgSubject}
        label="Discuss this service"
        sublabel={`Scoped with mxstermind · ${operator.name}`}
      />
    </main>
  );
}
