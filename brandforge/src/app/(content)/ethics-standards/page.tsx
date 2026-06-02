import type { Metadata } from "next";
import Link from "next/link";
import { CTASection, EthicsSection, FAQBlock, PageHero, PageShell } from "@/components/content";
import { BF_ETHICS_FAQ, BF_ETHICS_SECTIONS } from "@/content/ethics";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Ethics & Standards | BrandForge",
  description:
    "How BrandForge quotes, delivers, handles escrow, privacy, and IP — public rules for operator buyers.",
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
      faqs={BF_ETHICS_FAQ}
    >
      <PageHero
        eyebrow="Standards"
        title="Rules we scope into every quote"
        subhead="Not marketing — what happens in Discord when money and reputation are live."
      />
      <section className="py-8">
        <div className="content-wrap max-w-3xl text-sm text-text-secondary">
          <p>
            Bespoke engagements with longer discovery live at{" "}
            <Link href="https://mxstermind.com/ethics-standards" className="text-accent-bright">
              mxstermind ethics
            </Link>
            . Philosophy matches; tone differs.
          </p>
        </div>
      </section>
      <EthicsSection sections={BF_ETHICS_SECTIONS} />
      <FAQBlock items={BF_ETHICS_FAQ} />
      <CTASection
        title="Questions before you pay?"
        subhead="Ask in Discord or Telegram — no sales call required."
      />
    </PageShell>
  );
}
