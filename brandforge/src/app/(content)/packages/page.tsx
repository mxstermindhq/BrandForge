import type { Metadata } from "next";
import Link from "next/link";
import {
  CTASection,
  FAQBlock,
  PageHero,
  PageShell,
} from "@/components/content";
import { CalendlyEmbed } from "@/components/marketing/CalendlyEmbed";
import { ClientLogoBar } from "@/components/marketing/ClientLogoBar";
import { CopyInviteButton } from "@/components/marketing/CopyInviteButton";
import { DeliveryTimeline } from "@/components/marketing/DeliveryTimeline";
import { PackageComparisonTable } from "@/components/marketing/PackageComparisonTable";
import { StartPackageButton } from "@/components/marketing/StartPackageButton";
import { PACKAGES_LIST } from "@/content/home";
import { PACKAGES, SITE } from "@/config/site";
import type { PackageKey } from "@/config/site";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { ctaTrackAttrs, discordHref, telegramHref } from "@/lib/tracking";

export const metadata: Metadata = buildPageMetadata({
  title: "Packages & Pricing — BrandForge",
  description:
    "Five fixed USD tiers: Blueprint $300–$500, Automator $1.5k–$3k/mo, MVP Engine $5k/mo, AI & Community $7.5k/mo, Full-Stack $10k+/mo. Quote in 24 hours. Escrow accepted.",
  path: "/packages/",
});

const PACKAGES_FAQ = [
  {
    question: "Are BrandForge prices fixed or hourly?",
    answer:
      "Packages show honest ranges — final price depends on scope complexity. You receive a fixed USD quote within 24 hours after you message us on Discord or Telegram. No hourly billing surprises.",
  },
  {
    question: "Can I pay with crypto or escrow?",
    answer:
      "Yes. Every BrandForge order supports escrow-friendly workflows and crypto payment where both sides agree. We work with forum operators who will not pay without middleman protection.",
  },
  {
    question: "What if my project is bigger than Tier 5?",
    answer:
      "Above package tiers, mxstermind.com is the Founder Operating System — operating-system scope, longer timelines, outcome-based structuring. BrandForge packages stay fast and bounded.",
  },
  {
    question: "How fast does work start after I pay?",
    answer:
      "Kickoff typically within five business days once payment or escrow is confirmed. Rush delivery is quoted separately if you need overnight turnaround like our forum clients have received.",
  },
  {
    question: "What do the capacity limits mean?",
    answer:
      "Each tier caps concurrent deliverables (e.g. 3 workflows, 3 feature deployments, 3 automated assets). Extra scope is quoted before work starts — no silent overruns.",
  },
  {
    question: "How many revision rounds are included?",
    answer:
      "Blueprint includes two structured revision rounds on brand and lander. Retainers include revision cycles within each sprint — scope changes are quoted before work starts.",
  },
  {
    question: "Do you sign NDAs for confidential builds?",
    answer:
      "Yes. We ship confidential engagements regularly — portfolio entries can stay private while you still get vouch-backed credibility on intake.",
  },
] as const;

function tierBadge(pkg: (typeof PACKAGES_LIST)[number]): string | null {
  if (pkg.popular && pkg.key === "automator") return "Most popular";
  if (pkg.popular) return "Enterprise tier";
  return null;
}

export default function PackagesPage(): React.JSX.Element {
  const products = PACKAGES_LIST.map((pkg) => ({
    name: pkg.name,
    description: pkg.valueProposition,
    price: pkg.price.replace(/[^\d]/g, "") || "300",
    url: `https://brandforge.gg/packages/#${pkg.key}`,
  }));

  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Packages", href: "/packages/" },
      ]}
      path="/packages/"
      faqs={PACKAGES_FAQ}
      products={products}
    >
      <PageHero
        eyebrow="Packages"
        title={
          <>
            The 5 <em className="text-accent-bright not-italic">Packages.</em>
          </>
        }
        subhead="From one-time blueprint to enterprise retainer — fixed USD, capacity limits per tier, and a clear delivery matrix on the home page. Quote in 24 hours on Discord or Telegram."
      />

      <ClientLogoBar />
      <DeliveryTimeline />

      <section className="py-16">
        <div className="content-wrap space-y-8">
          {PACKAGES_LIST.map((pkg) => {
            const config = PACKAGES[pkg.key as PackageKey];
            const campaign = `packages-page-${pkg.key}`;
            const badge = tierBadge(pkg);
            return (
              <article
                key={pkg.key}
                className={`rounded-md border bg-s1 p-8 ${pkg.popular ? "border-accent" : "border-b1"} ${pkg.slotLimited ? "ring-1 ring-amber/30" : ""}`}
              >
                {badge ? (
                  <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-accent-bright">
                    {badge}
                  </p>
                ) : null}
                {pkg.slotLimited ? (
                  <p className="mt-2 font-mono text-[9px] font-semibold uppercase tracking-wider text-amber">
                    Limited slots
                  </p>
                ) : null}
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">{pkg.tier}</p>
                <h2 className="mt-2 text-2xl font-bold">{pkg.name}</h2>
                <p className="mt-3 max-w-2xl text-sm text-accent-bright">{pkg.valueProposition}</p>
                <p className="mt-4 font-mono text-2xl font-bold text-accent-bright">
                  {pkg.price}
                  <span className="text-lg text-text-secondary">{pkg.priceSub}</span>
                </p>
                <p className="mt-2 text-xs text-muted">{pkg.availability}</p>
                <p className="mt-1 font-mono text-[10px] text-muted">{pkg.time}</p>
                <p className="mt-4 rounded border border-b1 bg-bg p-4 text-sm text-text-secondary">
                  <span className="font-semibold text-text">Capacity: </span>
                  {pkg.capacityLimit}
                </p>
                <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="text-sm text-text-secondary">
                      · {feature}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs text-muted">{pkg.handoff}</p>
                <p className="mt-2 font-mono text-[10px] text-accent-bright">{pkg.avg}</p>
                <div className="mt-6 space-y-3">
                  <StartPackageButton packageKey={pkg.key as PackageKey} variant="primary" />
                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      href={telegramHref(config.telegramMsg, campaign)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded border border-b2 px-5 py-2.5 font-mono text-[11px] text-text-secondary hover:text-text"
                      {...ctaTrackAttrs("telegram", campaign)}
                    >
                      Or apply on Telegram
                    </a>
                    <CopyInviteButton campaign={`${campaign}-copy`} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        <p className="content-wrap mt-10 text-sm text-text-secondary">
          Compare deliverables in the{" "}
          <Link href="/#delivery" className="text-accent-bright">
            delivery matrix
          </Link>{" "}
          on the home page, or individual lines on the{" "}
          <Link href="/services/" className="text-accent-bright">
            services hub
          </Link>
          . Founder OS work lives at{" "}
          <a href={SITE.premium} className="text-accent-bright">
            mxstermind.com
          </a>
          .
        </p>
      </section>

      <PackageComparisonTable />

      <section className="border-t border-b1 bg-s1 py-16" aria-labelledby="custom-tier-title">
        <div className="content-wrap">
          <h2 id="custom-tier-title" className="text-2xl font-bold">
            Custom scope above Tier 5?
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-text-secondary">
            Book a free 15-min scope call or message with your brief — fixed quote in 24 hours.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={discordHref("packages-custom")}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded bg-discord px-5 py-2.5 font-mono text-[11px] font-bold text-white"
              {...ctaTrackAttrs("discord", "packages-custom")}
            >
              Discuss Founder OS on Discord
            </a>
            <CopyInviteButton campaign="packages-custom-copy" />
          </div>
          <div className="mt-10">
            <CalendlyEmbed campaign="packages-custom-calendly" />
          </div>
        </div>
      </section>

      <FAQBlock items={PACKAGES_FAQ} pageSlug="/packages/" title="Pricing & process FAQ" />
      <CTASection
        title="Ready for a fixed quote?"
        subhead="Send scope on Discord or Telegram — reply within 24 hours."
        campaign="packages-footer-cta"
      />
    </PageShell>
  );
}
