"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CONTACT } from "@/content/landing-directory";
import { profilePath } from "@/lib/reserved-paths";
import type { ServiceDetail } from "@/lib/service-types";
import type { ListingTrustMetrics } from "@/lib/trust-thresholds";
import { apiFetch } from "@/lib/api";
import { CryptoCheckoutButton } from "./CryptoCheckoutButton";
import { ListingIntelligenceVisual } from "@/components/marketplace/ListingIntelligenceVisual";
import { ListingSupportMenu } from "./ListingSupportMenu";

function formatEndsAt(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

type ServiceDetailViewProps = {
  service: ServiceDetail;
  canEdit?: boolean;
  autoCheckout?: boolean;
  checkoutCancelled?: boolean;
};

export function ServiceDetailView({
  service,
  canEdit = false,
  autoCheckout = false,
  checkoutCancelled = false,
}: ServiceDetailViewProps) {
  const endsLabel = formatEndsAt(service.endsAt);
  const ownerUsername = service.ownerUsername?.replace(/^@+/, "");
  const profileUrl = ownerUsername ? profilePath(ownerUsername) : null;
  const editUrl = canEdit && !service.isOfficial ? `/account/listings/${service.id}/edit` : null;
  const [trust, setTrust] = useState<ListingTrustMetrics | null>(null);

  useEffect(() => {
    void apiFetch<{ trust: ListingTrustMetrics | null }>(
      `/api/listings/${encodeURIComponent(service.id)}/trust?type=${service.isOfficial ? "official" : "db"}`,
      { method: "GET" },
    ).then(({ ok, data }) => {
      if (ok && data.trust) setTrust(data.trust);
    });
  }, [service.id, service.isOfficial]);

  return (
    <article className="forge-detail-article mt-6">
      <header className="border-b border-[var(--forge-border)] px-6 py-6">
        <div className="flex flex-wrap gap-2">
          <span className="forge-tag">{service.category}</span>
          {service.listingType === "partner" ? (
            <span className="forge-tag">Subscription</span>
          ) : endsLabel ? (
            <span className="forge-tag">Ends {endsLabel}</span>
          ) : (
            <span className="forge-tag">Starter</span>
          )}
          {service.isOfficial ? <span className="forge-tag">Official</span> : null}
        </div>
        <h1 className="font-headline mt-4 text-4xl font-semibold text-[var(--forge-text)]">{service.title}</h1>
        <p className="mt-2 text-lg text-[var(--forge-text-muted)]">{service.tagline}</p>
      </header>

      <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1.35fr_0.65fr]">
        <div>
          {service.intelligence ? (
            <ListingIntelligenceVisual
              intelligence={service.intelligence}
              category={service.category}
              deliveryLabel={service.deliveryLabel}
              tagline={service.tagline}
              trust={trust}
            />
          ) : null}

          <p className="mt-6 text-base leading-relaxed text-[var(--forge-text-muted)]">{service.description}</p>

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

            {checkoutCancelled ? (
              <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-950/20 p-3 text-sm text-amber-200">
                Checkout was cancelled. You can retry payment below.
              </p>
            ) : null}

            <div className="mt-6">
              <CryptoCheckoutButton
                listingId={service.id}
                priceLabel={service.priceLabel}
                autoStart={autoCheckout}
              />
              <a
                href={CONTACT.discord}
                target="_blank"
                rel="noopener noreferrer"
                className="forge-btn forge-btn-ghost mt-2 w-full justify-center text-sm"
              >
                Ask Questions
              </a>
              <ListingSupportMenu listingTitle={service.title} />
              {editUrl ? (
                <Link href={editUrl} className="forge-btn forge-btn-ghost mt-3 w-full justify-center text-center text-xs">
                  Edit listing
                </Link>
              ) : null}
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}
