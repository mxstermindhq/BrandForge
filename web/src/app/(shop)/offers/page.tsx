import type { Metadata } from "next";
import Link from "next/link";
import { ForgeButton } from "@/components/marketplace/ForgeButton";
import { CONTACT, contactMessage } from "@/content/landing-directory";
import { OFFERS } from "@/lib/marketplace";

export const metadata: Metadata = {
  title: "Offers & Drops",
  description: "Limited bundles and high-value packs from the forge.",
};

export default function OffersPage() {
  return (
    <main className="forge-page">
      <div className="forge-container forge-page-inner">
        <Link href="/#browse" className="forge-back-link">
          ← Marketplace
        </Link>
        <p className="forge-section-eyebrow forge-page-eyebrow">Limited drops</p>
        <h1 className="forge-section-title forge-page-title">Forge offers</h1>
        <p className="forge-section-desc">Bundles — more value, one conversation, fast execution.</p>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {OFFERS.map((offer) => (
            <article key={offer.id} className="mp-offer-card">
              <div className="mp-offer-thumb" style={{ background: offer.thumbGradient }}>
                {offer.badge ? <span className="mp-offer-badge">{offer.badge}</span> : null}
                {offer.limited ? <span className="mp-offer-limited">Limited</span> : null}
              </div>
              <div className="p-5">
                <h2 className="font-headline text-xl font-semibold text-[var(--forge-text)]">{offer.title}</h2>
                <p className="mt-1 text-sm text-[var(--forge-text-muted)]">{offer.tagline}</p>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-headline text-3xl font-semibold text-[var(--forge-gold)]">{offer.priceLabel}</span>
                  {offer.originalPrice ? (
                    <span className="text-sm text-[var(--forge-text-muted)] line-through">${offer.originalPrice}</span>
                  ) : null}
                </div>
                <p className="mt-1 text-xs text-[var(--forge-text-muted)]">{offer.deliveryLabel}</p>
                <ul className="mt-4 space-y-1 text-sm text-[var(--forge-text-muted)]">
                  {offer.includes.map((inc) => (
                    <li key={inc}>
                      <span className="text-[var(--forge-fire)]">✓</span> {inc}
                    </li>
                  ))}
                </ul>
                <div className="mt-5">
                  <ForgeButton
                    href={contactMessage(`Bundle: ${offer.title} (${offer.priceLabel})`)}
                    variant="primary"
                    external
                    small
                    dataTrack={`offer_${offer.id}`}
                  >
                    Claim via Telegram
                  </ForgeButton>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="forge-surface-card mt-12 text-center">
          <p className="text-sm text-[var(--forge-text-muted)]">Want a custom bundle? Message the forge.</p>
          <div className="mt-4 flex justify-center gap-3">
            <ForgeButton href={CONTACT.discord} variant="secondary" external small>
              Discord
            </ForgeButton>
            <ForgeButton href={CONTACT.telegram} variant="primary" external small>
              Telegram
            </ForgeButton>
          </div>
        </div>
      </div>
    </main>
  );
}
