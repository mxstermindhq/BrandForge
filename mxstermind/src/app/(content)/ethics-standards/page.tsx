import type { Metadata } from "next";
import Link from "next/link";
import { CTASection, EthicsSection, FAQBlock, PageHero, PageShell } from "@/components/content";
import { MM_ETHICS_FAQ, MM_ETHICS_SECTIONS } from "@/content/ethics";
import { SITE } from "@/config/site";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Ethics & Standards | mxstermind",
  description:
    "Selective intake, delivery, payments, privacy, and quality standards for bespoke mxstermind engagements.",
  path: "/ethics-standards/",
});

export default function EthicsPage(): React.JSX.Element {
  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Ethics", href: "/ethics-standards/" },
      ]}
      path="/ethics-standards/"
      schemaType="ethics"
      faqs={MM_ETHICS_FAQ}
    >
      <PageHero
        eyebrow="Standards"
        title="Rules scoped into every bespoke quote"
        subhead="Operational ethics for established buyers — not marketing filler."
      />
      <section className="py-8">
        <div className="content-wrap max-w-3xl text-sm text-text-secondary">
          <p>
            Productized packages and operator tiers live at{" "}
            <Link href={`${SITE.brandforge}ethics-standards/`} className="text-accent-bright">
              BrandForge ethics
            </Link>
            . Philosophy aligns; mxstermind tone is formal for business diligence.
          </p>
        </div>
      </section>
      <section className="content-wrap py-8">
        <EthicsSection sections={MM_ETHICS_SECTIONS} />
      </section>
      <FAQBlock items={MM_ETHICS_FAQ} />
      <CTASection title="Diligence questions?" subhead="Ask in Discord or Telegram before deposit." />
    </PageShell>
  );
}
