import type { Metadata } from "next";
import { CTASection, DevCard, FAQBlock, PageHero, PageShell } from "@/components/content";
import { DEV_HUB_CARDS, DEV_HUB_FAQ } from "@/content/developers/pages";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Developers — Technical Platform | mxstermind",
  description:
    "Documented stack, AI systems, blockchain, automation, integrations, and open architecture writeups.",
  path: "/developers/",
});

export default function DevelopersHubPage(): React.JSX.Element {
  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Developers", href: "/developers/" },
      ]}
      path="/developers/"
      faqs={DEV_HUB_FAQ}
    >
      <PageHero
        eyebrow="Developers"
        title="Technical depth before the sales call"
        subhead="How we choose stack, ship AI and Web3 systems, and document architecture from real engagements."
      />
      <section className="py-12">
        <div className="content-wrap grid gap-4 sm:grid-cols-2">
          {DEV_HUB_CARDS.map((card) => (
            <DevCard key={card.slug} card={card} />
          ))}
        </div>
      </section>
      <FAQBlock items={DEV_HUB_FAQ} />
      <CTASection title="Bring your stack constraints" subhead="Apply with repo access or architecture docs — audit before quote." />
    </PageShell>
  );
}
