import type { Metadata } from "next";
import Link from "next/link";
import {
  CTASection,
  FAQBlock,
  PageHero,
  PageShell,
  PortfolioCard,
} from "@/components/content";
import { PACKAGES_LIST } from "@/content/home";
import { SITE, telegramUrl, PACKAGES } from "@/config/site";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Packages & Pricing — BrandForge",
  description:
    "Fixed USD packages: Brand Sprint from $500, Launch Stack $2.5k–$7.5k, Growth Engine $3.5k/mo. Quote in 24 hours. Escrow accepted.",
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
    question: "What if my project is bigger than Growth Engine?",
    answer:
      "For bespoke scope above package tiers, mxstermind.com handles premium engagements — custom teams, longer timelines, outcome-based structuring. BrandForge packages stay fast and bounded.",
  },
  {
    question: "How fast does work start after I pay?",
    answer:
      "Kickoff typically within five business days once payment or escrow is confirmed. Rush delivery is quoted separately if you need overnight turnaround like our forum clients have received.",
  },
] as const;

export default function PackagesPage(): React.JSX.Element {
  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Packages", href: "/packages/" },
      ]}
      path="/packages/"
      faqs={PACKAGES_FAQ}
    >
      <PageHero
        eyebrow="Packages"
        title={
          <>
            Fixed USD. <em className="text-accent-bright not-italic">No guesswork.</em>
          </>
        }
        subhead="Three starting points for operators who want one invoice, one team, and a clear handoff — not a six-month retainer with vague deliverables."
      />

      <section className="py-16">
        <div className="content-wrap space-y-8">
          {PACKAGES_LIST.map((pkg) => {
            const config = PACKAGES[pkg.key];
            return (
              <article
                key={pkg.key}
                className={`rounded-md border bg-s1 p-8 ${pkg.popular ? "border-accent" : "border-b1"}`}
              >
                {pkg.popular ? (
                  <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-accent-bright">
                    Most popular
                  </p>
                ) : null}
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">{pkg.tier}</p>
                <h2 className="mt-2 text-2xl font-bold">{pkg.name}</h2>
                <p className="mt-3 max-w-2xl text-sm text-text-secondary">{pkg.description}</p>
                <p className="mt-4 font-mono text-2xl font-bold text-accent-bright">
                  {pkg.price}
                  <span className="text-lg text-text-secondary">{pkg.priceSub}</span>
                </p>
                <p className="mt-1 text-xs text-muted">{pkg.range}</p>
                <p className="mt-2 font-mono text-[10px] text-muted">{pkg.time}</p>
                <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="text-sm text-text-secondary">
                      · {feature}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs text-muted">{pkg.handoff}</p>
                <p className="mt-2 font-mono text-[10px] text-accent-bright">{pkg.avg}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href={SITE.discord}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded bg-discord px-5 py-2.5 font-mono text-[11px] font-bold text-white"
                  >
                    Order on Discord
                  </a>
                  <a
                    href={telegramUrl(config.telegramMsg)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded border border-b2 px-5 py-2.5 font-mono text-[11px] text-text-secondary hover:text-text"
                  >
                    Order on Telegram
                  </a>
                </div>
              </article>
            );
          })}
        </div>
        <p className="content-wrap mt-10 text-sm text-text-secondary">
          Compare individual lines on the{" "}
          <Link href="/services/" className="text-accent-bright">
            services hub
          </Link>
          . Premium bespoke work lives at{" "}
          <a href={SITE.premium} className="text-accent-bright">
            mxstermind.com
          </a>
          .
        </p>
      </section>

      <FAQBlock items={PACKAGES_FAQ} />
      <CTASection title="Ready for a fixed quote?" subhead="Send scope on Discord or Telegram — reply within 24 hours." />
    </PageShell>
  );
}
