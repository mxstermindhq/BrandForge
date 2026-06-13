import type { Metadata } from "next";
import { CTASection, FAQBlock, PageHero, PageShell } from "@/components/content";
import { ResourceDownloadLink } from "@/components/marketing/ResourceDownloadLink";
import { ctaTrackAttrs, discordHref } from "@/lib/tracking";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Partners & Tools — BrandForge",
  description:
    "Tools we recommend for operators plus partnership opportunities with BrandForge. Affiliate links disclosed.",
  path: "/partners/",
});

const PARTNERS_FAQ = [
  {
    question: "Are affiliate links disclosed?",
    answer:
      "Yes. Every recommended tool with an affiliate relationship is marked. We only list tools we actually use on client projects.",
  },
  {
    question: "How do I partner with BrandForge?",
    answer:
      "Message us on Discord with your audience, niche, and what you want to co-promote. We reply within 24 hours with fit and commission structure.",
  },
  {
    question: "Do you white-label for agencies?",
    answer:
      "Selectively — for established agencies serving forum, gaming, or Web3 clients. Start with scope on Discord.",
  },
] as const;

const TOOLS = [
  {
    name: "Cloudflare",
    use: "Hosting, CDN, and Workers for static sites",
    href: "https://www.cloudflare.com/",
    affiliate: false,
  },
  {
    name: "n8n",
    use: "Workflow automation for Automator tier clients",
    href: "https://n8n.io/",
    affiliate: false,
  },
  {
    name: "Figma",
    use: "Brand and UI design handoff",
    href: "https://www.figma.com/",
    affiliate: false,
  },
] as const;

export default function PartnersPage(): React.JSX.Element {
  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Partners", href: "/partners/" },
      ]}
      path="/partners/"
      faqs={PARTNERS_FAQ}
    >
      <PageHero
        eyebrow="Partners"
        title={
          <>
            Tools we trust. <em className="text-accent-bright not-italic">Partners we grow with.</em>
          </>
        }
        subhead="Honest recommendations for operators — plus how to co-market or white-label with BrandForge."
      />

      <section className="py-16">
        <div className="content-wrap space-y-6">
          {TOOLS.map((tool) => (
            <article key={tool.name} className="rounded-md border border-b1 bg-s1 p-6">
              <h2 className="text-lg font-bold">{tool.name}</h2>
              <p className="mt-2 text-sm text-text-secondary">{tool.use}</p>
              <a
                href={tool.href}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="mt-3 inline-block font-mono text-[10px] text-accent-bright"
              >
                Visit {tool.name} ↗
              </a>
              {tool.affiliate ? (
                <p className="mt-2 font-mono text-[9px] text-muted">Affiliate link — supports BrandForge</p>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-b1 bg-s1 py-16">
        <div className="content-wrap">
          <h2 className="text-xl font-bold">Partner with BrandForge</h2>
          <p className="mt-3 max-w-2xl text-sm text-text-secondary">
            Communities, agencies, and tool vendors — co-marketing, referral fees, or white-label delivery.
            Apply via Discord with audience size and niche.
          </p>
          <a
            href={discordHref("partners-apply")}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block rounded bg-discord px-5 py-2.5 font-mono text-[11px] font-bold text-white"
            {...ctaTrackAttrs("discord", "partners-apply")}
          >
            Apply on Discord
          </a>
        </div>
      </section>

      <section className="py-16">
        <div className="content-wrap">
          <h2 className="text-xl font-bold">Free resources</h2>
          <p className="mt-2 text-sm text-muted">Download → tracked in GA. Join Discord for updates.</p>
          <ul className="mt-6 space-y-3">
            {[
              { name: "Discord Server Branding Checklist", file: "/downloads/discord-branding-checklist.pdf" },
              { name: "Web3 Brand Trust Framework", file: "/downloads/web3-brand-trust-framework.pdf" },
              { name: "Brand Style Guide Template", file: "/downloads/brand-style-guide-template.pdf" },
            ].map((r) => (
              <li key={r.file}>
                <ResourceDownloadLink href={r.file} name={r.name} />
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted">
            PDF placeholders — replace with final assets in <code className="font-mono">public/downloads/</code>.
          </p>
        </div>
      </section>

      <FAQBlock items={PARTNERS_FAQ} pageSlug="/partners/" />
      <CTASection
        title="Want to partner?"
        subhead="Discord intake — fixed reply in 24 hours."
        campaign="partners-footer-cta"
      />
    </PageShell>
  );
}
