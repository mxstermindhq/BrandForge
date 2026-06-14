import type { Metadata } from "next";
import Link from "next/link";
import { CTASection, FAQBlock, PageHero, PageShell } from "@/components/content";
import { SERVICE_HUB_CARDS, SERVICES_HUB_FAQ } from "@/content/hubs/services-hub";
import { SITE } from "@/config/site";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Services — Founder OS Modules | mxstermind",
  description:
    "Monetization, product engineering, Web3, automation, and growth architecture — modules of the Founder Operating System.",
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
      serviceName="mxstermind Founder OS modules"
      serviceDescription="Monetization, design, engineering, Web3, automation, and growth systems for founders scaling beyond packages."
      faqs={SERVICES_HUB_FAQ}
    >
      <PageHero
        eyebrow="Services"
        title={
          <>
            One OS. <em className="text-accent-bright not-italic">Many modules.</em>
          </>
        }
        subhead="Monetization, product, engineering, Web3, automation, and growth — scoped as operating-system outcomes for your stage."
        primaryCta={{ label: "Apply on Discord", href: SITE.discord }}
      />

      <section className="py-16">
        <div className="content-wrap">
          <p className="max-w-2xl text-sm leading-relaxed text-text-secondary">
            mxstermind is the Founder Operating System — not a package cart. Every OS engagement starts with fit review on Discord or Telegram,
            then a fixed USD scope for the operating layer you need. For bounded execution, see{" "}
            <a href={SITE.packages} className="text-accent-bright hover:text-text" rel="noopener noreferrer">
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
