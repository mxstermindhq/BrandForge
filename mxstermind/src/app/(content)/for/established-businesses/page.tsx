import type { Metadata } from "next";
import Link from "next/link";
import { CTASection, FAQBlock, PageHero, PageShell } from "@/components/content";
import { ESTABLISHED_BUSINESSES_COPY, ESTABLISHED_BUSINESSES_FAQ } from "@/content/niche/established-businesses";
import { SITE } from "@/config/site";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "For Established Businesses | mxstermind",
  description:
    "Bespoke design and engineering when template agencies and hourly dev shops are not enough — mxstermind for scaling companies.",
  path: "/for/established-businesses/",
});

export default function EstablishedBusinessesPage(): React.JSX.Element {
  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "For businesses", href: "/for/established-businesses/" },
      ]}
      path="/for/established-businesses/"
      faqs={ESTABLISHED_BUSINESSES_FAQ}
    >
      <PageHero
        eyebrow="Established businesses"
        title={ESTABLISHED_BUSINESSES_COPY.headline}
        subhead={ESTABLISHED_BUSINESSES_COPY.subhead}
        primaryCta={{ label: "Apply on Discord", href: SITE.discord }}
      />
      <section className="py-12">
        <div className="content-wrap grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="font-serif text-xl font-light">Your specific pain</h2>
            <ul className="mt-4 space-y-3">
              {ESTABLISHED_BUSINESSES_COPY.pains.map((pain) => (
                <li key={pain} className="flex gap-2 text-sm text-text-secondary">
                  <span className="text-accent-bright">·</span>
                  {pain}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-serif text-xl font-light">Proof in your weight class</h2>
            <ul className="mt-4 space-y-2">
              {ESTABLISHED_BUSINESSES_COPY.proof.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="font-mono text-[11px] text-accent-bright hover:text-text">
                    {item.name} →
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-text-secondary">{ESTABLISHED_BUSINESSES_COPY.pricingAnchor}</p>
          </div>
        </div>
      </section>
      <FAQBlock items={ESTABLISHED_BUSINESSES_FAQ} title="Objections procurement asks" />
      <CTASection title="Bring your milestone date" subhead="We scope fixed USD engagements after fit review." />
    </PageShell>
  );
}
