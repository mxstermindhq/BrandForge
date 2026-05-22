"use client";

import Link from "next/link";
import { CONTACT, contactMessage } from "@/content/landing-directory";
import { profilePath } from "@/lib/reserved-paths";
import type { ServiceDetail } from "@/lib/service-types";
import { CryptoCheckoutButton } from "./CryptoCheckoutButton";
import { ListingIntelligenceVisual } from "@/components/marketplace/ListingIntelligenceVisual";

function formatEndsAt(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

type ServiceDetailViewProps = {
  service: ServiceDetail;
  canEdit?: boolean;
};

export function ServiceDetailView({ service, canEdit = false }: ServiceDetailViewProps) {
  const endsLabel = formatEndsAt(service.endsAt);
  const ownerUsername = service.ownerUsername?.replace(/^@+/, "");
  const profileUrl = ownerUsername ? profilePath(ownerUsername) : null;
  const editUrl = canEdit && !service.isOfficial ? `/account/listings/${service.id}/edit` : null;

  return (
    <article className="forge-detail-article mt-6">
      <div
        className="relative h-48 w-full overflow-hidden sm:h-56"
        style={{ background: service.thumbGradient }}
      >
        <div className="absolute inset-0 mp-heat-overlay" aria-hidden />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span className="forge-tag">{service.category}</span>
          {service.listingType === "long_term" ? (
            <span className="forge-tag">Subscription</span>
          ) : endsLabel ? (
            <span className="forge-tag">Ends {endsLabel}</span>
          ) : (
            <span className="forge-tag">Short term</span>
          )}
          {service.isOfficial ? <span className="forge-tag">BrandForge Official</span> : null}
        </div>
      </div>

      <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1.35fr_0.65fr]">
        <div>
          <h1 className="font-headline text-4xl font-semibold text-[var(--forge-text)]">{service.title}</h1>
          <p className="mt-3 text-lg text-[var(--forge-text-muted)]">{service.tagline}</p>

          {service.intelligence ? (
            <div className="mt-6">
              <ListingIntelligenceVisual intelligence={service.intelligence} category={service.category} />
            </div>
          ) : null}

          <p className="mt-6 text-base leading-relaxed text-[var(--forge-text-secondary,var(--forge-text-muted))]">
            {service.description}
          </p>

          {service.deliverables.length ? (
            <>
              <h2 className="forge-section-eyebrow mt-8">What you get</h2>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {service.deliverables.map((item) => (
                  <li key={item} className="forge-surface-card py-2.5 text-sm">
                    <span className="mr-2 text-[var(--forge-fire)]">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </>
          ) : null}

          {service.useCases.length ? (
            <>
              <h2 className="forge-section-eyebrow mt-8">Perfect if you</h2>
              <ul className="mt-4 space-y-2">
                {service.useCases.map((item) => (
                  <li key={item} className="text-sm text-[var(--forge-text-muted)]">
                    → {item}
                  </li>
                ))}
              </ul>
            </>
          ) : null}

          {service.tags.length ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {service.tags.map((t) => (
                <span key={t} className="mp-tag">
                  {t}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <aside className="offer-sticky-panel">
          <div className="forge-detail-panel forge-detail-panel-accent">
            <p className="forge-section-eyebrow">Price</p>
            <p className="font-headline text-5xl font-semibold text-[var(--forge-text)]">{service.priceLabel}</p>
            <p className="mt-2 text-sm text-[var(--forge-text-muted)]">
              Delivery: <strong className="text-[var(--forge-gold)]">{service.deliveryLabel}</strong>
            </p>
            {profileUrl ? (
              <Link href={profileUrl} className="mt-4 block text-sm text-[var(--forge-gold)] hover:underline">
                Seller: {service.ownerName}
                {ownerUsername ? ` @${ownerUsername}` : ""}
              </Link>
            ) : (
              <p className="mt-4 text-sm text-[var(--forge-text-muted)]">Seller: {service.ownerName}</p>
            )}
            <div className="mt-6 space-y-2">
              <CryptoCheckoutButton listingId={service.id} priceLabel={service.priceLabel} />
              <a
                href={CONTACT.discord}
                target="_blank"
                rel="noopener noreferrer"
                className="forge-btn forge-btn-ghost w-full justify-center text-sm"
              >
                Questions on Discord
              </a>
              <a
                href={contactMessage(`Question: ${service.title}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-xs text-[var(--forge-text-muted)] hover:text-[var(--forge-gold)]"
              >
                Telegram support
              </a>
              {editUrl ? (
                <Link href={editUrl} className="forge-btn forge-btn-ghost mt-3 w-full justify-center text-center">
                  Edit listing
                </Link>
              ) : null}
            </div>
            <p className="mt-4 text-xs text-[var(--forge-text-muted)]">
              Instant crypto checkout via NOWPayments. Escrow support on {CONTACT.guarantor} for scope disputes.
            </p>
          </div>
        </aside>
      </div>
    </article>
  );
}
