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
    <main className="forge-page pb-28">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="forge-container forge-page-inner">
        <Link href="/#trending" className="forge-back-link">
          ← Marketplace
        </Link>

        <article className="forge-detail-article mt-6">
          <div className="relative h-64 w-full overflow-hidden sm:h-80">
            <Image
              src={service.image}
              alt={service.name}
              fill
              sizes="(max-width: 768px) 100vw, 1100px"
              className="object-cover"
              priority
            />
            <span className="absolute left-4 top-4 forge-tag backdrop-blur">Scoped service</span>
          </div>

          <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1.35fr_0.65fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.1em] text-[var(--forge-text-muted)]">
                Operator{" "}
                <Link href={`/${encodeURIComponent(operator.username)}`} className="text-[var(--forge-gold)] hover:underline">
                  {operator.name}
                </Link>
              </p>
              <h1 className="mt-2 font-headline text-4xl font-semibold text-[var(--forge-text)]">{service.name}</h1>
              <p className="mt-4 text-base leading-relaxed text-[var(--forge-text-muted)]">{service.tagline}</p>

              <h2 className="mt-8 text-sm font-semibold uppercase tracking-[0.1em] text-[var(--forge-text-muted)]">
                What&apos;s included
              </h2>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {service.bullets.map((bullet) => (
                  <li key={bullet} className="forge-surface-card py-2.5 text-sm text-[var(--forge-text-muted)]">
                    <span className="mr-2 text-[var(--forge-fire)]">✓</span>
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>

            <aside className="offer-sticky-panel">
              <div className="forge-detail-panel forge-detail-panel-accent">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--forge-gold)]">Starting from</p>
                <p className="mt-2 font-headline text-4xl font-semibold text-[var(--forge-text)]">{service.price}</p>
                <p className="mt-3 text-sm text-[var(--forge-text-muted)]">
                  Direct scope on Discord or Telegram. Fast delivery, no bidding.
                </p>
                <a
                  href={contactMessage(tgSubject)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="forge-btn forge-btn-primary mt-6 flex min-h-12 w-full items-center justify-center text-sm"
                  data-track="offer_primary_cta"
                >
                  Get this service →
                </a>
                <Link
                  href={`/${encodeURIComponent(operator.username)}`}
                  className="forge-btn forge-btn-secondary mt-3 flex min-h-11 w-full items-center justify-center text-sm"
                  data-track="offer_profile_link"
                >
                  View {operator.name}&apos;s profile
                </Link>
              </div>
            </aside>
          </div>
        </article>
      </div>

      <StickyConversationCTA
        subject={tgSubject}
        label="Discuss this service"
        sublabel={`${operator.name} · BrandForge forge`}
      />
    </main>
  );
}
