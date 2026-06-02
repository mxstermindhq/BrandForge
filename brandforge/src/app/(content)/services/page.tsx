import type { Metadata } from "next";
import Link from "next/link";
import {
  CTASection,
  FAQBlock,
  PageHero,
  PageShell,
  ServiceCard,
} from "@/components/content";
import { SERVICE_HUB_CARDS, SERVICES_HUB_FAQ } from "@/content/hubs/services-hub";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Services — Design, Dev & Growth | BrandForge",
  description:
    "Nine service lines for operators: brand identity, web, mobile, Discord, automation, AI tools, SEO/GEO, paid ads, and social. Fixed quotes in 24h.",
  path: "/services/",
});

export default function ServicesHubPage(): React.JSX.Element {
  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Services", href: "/services/" },
      ]}
      path="/services/"
      faqs={SERVICES_HUB_FAQ}
    >
      <PageHero
        eyebrow="Services"
        title={
          <>
            One team. <em className="text-accent-bright not-italic">Nine disciplines.</em>
          </>
        }
        subhead="BrandForge runs design, development, and growth under one roof — so you are not chasing three vendors on Discord. Pick a service line or start from a package."
        primaryCta={{ label: "Get a quote on Discord", href: "https://discord.gg/a8Nz2R6M55" }}
      />

      <section className="py-16">
        <div className="content-wrap">
          <p className="max-w-2xl text-sm leading-relaxed text-text-secondary">
            Every service below ships with a fixed USD quote within 24 hours. Escrow and crypto accepted.
            Forum operators, Web3 founders, gaming communities, and SaaS teams use BrandForge when they
            need output — not another strategy deck.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICE_HUB_CARDS.map((service) => (
              <ServiceCard key={service.slug} service={service} />
            ))}
          </div>
          <p className="mt-10 text-sm text-text-secondary">
            Need multiple lines? See{" "}
            <Link href="/packages/" className="text-accent-bright hover:text-text">
              packages
            </Link>{" "}
            or the{" "}
            <Link href="/roadmap/" className="text-accent-bright hover:text-text">
              marketer roadmap
            </Link>{" "}
            to pick your stage.
          </p>
        </div>
      </section>

      <FAQBlock items={SERVICES_HUB_FAQ} />
      <CTASection
        title="Tell us what you are building"
        subhead="Discord or Telegram — fixed quote in 24 hours. No forms, no calendar links."
      />
    </PageShell>
  );
}
