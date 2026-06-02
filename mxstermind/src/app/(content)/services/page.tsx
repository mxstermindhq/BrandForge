import type { Metadata } from "next";
import Link from "next/link";
import { CTASection, FAQBlock, PageHero, PageShell } from "@/components/content";
import { SERVICE_HUB_CARDS, SERVICES_HUB_FAQ } from "@/content/hubs/services-hub";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Services — Bespoke Design & Engineering | mxstermind",
  description:
    "Custom brand, full-stack, Web3, automation, and growth architecture for established businesses. No packages — fixed scope after fit.",
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
      schemaType="service"
      serviceName="mxstermind bespoke services"
      serviceDescription="Custom design, engineering, Web3, automation, and growth for established businesses."
      faqs={SERVICES_HUB_FAQ}
    >
      <PageHero
        eyebrow="Services"
        title={
          <>
            One studio. <em className="text-accent-bright not-italic">Custom scope.</em>
          </>
        }
        subhead="Brand, product, engineering, Web3, automation, and growth — quoted as a single outcome when your build demands it."
        primaryCta={{ label: "Apply on Discord", href: "https://discord.gg/a8Nz2R6M55" }}
      />

      <section className="py-16">
        <div className="content-wrap">
          <p className="max-w-2xl text-sm leading-relaxed text-text-secondary">
            mxstermind does not publish shopping-cart packages. Every engagement starts with fit review on Discord or Telegram,
            then a fixed USD scope document. For productized tiers, see{" "}
            <a href="https://brandforge.gg/packages/" className="text-accent-bright hover:text-text" rel="noopener noreferrer">
              BrandForge packages
            </a>
            .
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {SERVICE_HUB_CARDS.map((service) => (
              <Link
                key={service.slug}
                href={service.href}
                className="block rounded-sm border border-b1 bg-s1 p-6 transition-colors hover:border-accent"
              >
                <span className="text-accent-bright">{service.icon}</span>
                <h3 className="mt-3 font-serif text-xl font-light">{service.title}</h3>
                <p className="mt-2 text-sm text-text-secondary">{service.description}</p>
              </Link>
            ))}
          </div>
          <p className="mt-10 text-sm text-text-secondary">
            Technical depth documented on{" "}
            <Link href="/developers/" className="text-accent-bright hover:text-text">
              /developers/
            </Link>{" "}
            — stack choices, AI, blockchain, and open architecture notes.
          </p>
        </div>
      </section>

      <FAQBlock items={SERVICES_HUB_FAQ} />
      <CTASection title="Scope your outcome" subhead="Share deadline and budget band — fixed quote after fit review." />
    </PageShell>
  );
}
