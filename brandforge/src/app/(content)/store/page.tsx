import type { Metadata } from "next";
import { CTASection, PageHero, PageShell } from "@/components/content";
import { ctaTrackAttrs, discordHref } from "@/lib/tracking";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Template Store — Coming Soon | BrandForge",
  description: "Premium templates and assets from BrandForge — notify list opening soon.",
  path: "/store/",
});

export default function StorePage(): React.JSX.Element {
  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Store", href: "/store/" },
      ]}
      path="/store/"
    >
      <PageHero
        eyebrow="Store"
        title={
          <>
            Premium templates — <em className="text-accent-bright not-italic">coming soon.</em>
          </>
        }
        subhead="Figma kits, Discord asset packs, and lander templates. Join Discord to get notified when the store opens."
      />

      <section className="py-16">
        <div className="content-wrap max-w-xl">
          <ul className="space-y-3 text-sm text-text-secondary">
            <li>· Discord launch kit templates</li>
            <li>· Web3 trust lander blocks</li>
            <li>· Forum seller storefront UI</li>
          </ul>
          <a
            href={discordHref("store-notify")}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-block rounded bg-discord px-6 py-3 font-mono text-[11px] font-bold text-white"
            {...ctaTrackAttrs("discord", "store-notify")}
          >
            Notify me on Discord
          </a>
        </div>
      </section>

      <CTASection
        title="Need assets now?"
        subhead="Blueprint package includes brand kit + templates in 1–2 weeks."
        campaign="store-footer-cta"
      />
    </PageShell>
  );
}
