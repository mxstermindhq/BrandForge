import type { Metadata } from "next";
import Link from "next/link";
import { CTASection, FAQBlock, PageHero, PageShell } from "@/components/content";
import { CrossPlatformLink } from "@/components/marketing/CrossPlatformLink";
import { EcosystemDownloadLink } from "@/components/marketing/EcosystemDownloadLink";
import { ECOSYSTEM } from "@/config/ecosystem";
import {
  DUAL_TESTIMONIALS,
  ECOSYSTEM_FAQ,
  JOINT_CASE_STUDIES,
} from "@/content/shared/ecosystem";
import { ctaTrackAttrs, discordHref } from "@/lib/tracking";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "MXSTERMIND — Founder Operating System | BrandForge",
  description:
    "BrandForge executes packages. mxstermind is the Founder OS for monetization, ops, and scale. Shared case studies and cross-platform navigation.",
  path: "/mxstermind/",
});

export default function MxstermindBridgePage(): React.JSX.Element {
  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "MXSTERMIND", href: "/mxstermind/" },
      ]}
      path="/mxstermind/"
      faqs={ECOSYSTEM_FAQ}
    >
      <PageHero
        eyebrow="Founder Operating System"
        title={
          <>
            BrandForge executes packages.{" "}
            <em className="text-accent-bright not-italic">mxstermind runs the OS.</em>
          </>
        }
        subhead={ECOSYSTEM.bridgeCopy}
      />

      <section className="border-b border-b1 bg-s1 py-16">
        <div className="content-wrap grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-lg font-bold">What is mxstermind?</h2>
            <p className="mt-4 text-sm leading-relaxed text-text-secondary">
              {ECOSYSTEM.mxstermind.tagline} The Founder OS for operators who validated revenue and
              need monetization rails, ops workflows, and growth systems — not another agency SOW.
            </p>
            <CrossPlatformLink
              href={ECOSYSTEM.mxstermind.url}
              platform="mxstermind"
              campaign="mxm-bridge-hero"
              className="mt-6 inline-block rounded border border-accent px-5 py-2.5 font-mono text-[11px] font-bold text-accent-bright"
            >
              Explore Founder OS ↗
            </CrossPlatformLink>
          </div>
          <div>
            <h2 className="text-lg font-bold">Who is it for?</h2>
            <p className="mt-4 text-sm leading-relaxed text-text-secondary">
              {ECOSYSTEM.mxstermind.audience}
            </p>
            <p className="mt-4 text-sm text-text-secondary">
              <strong className="text-text">BrandForge:</strong> {ECOSYSTEM.brandforge.audience}
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="content-wrap">
          <h2 className="text-lg font-bold">Shared case studies</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {JOINT_CASE_STUDIES.map((c) => (
              <article key={c.slug} className="rounded-md border border-b1 bg-s2 p-5">
                <Link href={c.href} className="font-bold hover:text-accent-bright">
                  {c.name}
                </Link>
                <p className="mt-3 text-xs text-text-secondary">
                  <span className="text-accent-bright">BrandForge:</span> {c.brandforge}
                </p>
                <p className="mt-2 text-xs text-text-secondary">
                  <span className="text-accent-bright">MXSTERMIND:</span> {c.mxstermind}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-b1 bg-s1 py-16">
        <div className="content-wrap">
          <h2 className="text-lg font-bold">Testimonials</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {DUAL_TESTIMONIALS.map((t) => (
              <blockquote key={t.quote.slice(0, 24)} className="rounded-md border border-b1 bg-bg p-6">
                <p className="text-sm italic text-text-secondary">&ldquo;{t.quote}&rdquo;</p>
                <footer className="mt-3 font-mono text-[10px] text-muted">
                  {t.who} · {t.context}
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="content-wrap max-w-xl">
          <h2 className="text-lg font-bold">The Creator Economy Stack</h2>
          <p className="mt-3 text-sm text-text-secondary">
            Joint PDF — BrandForge branding guide + mxstermind Founder OS monetization framework.
            Download on either site; join Discord for Ecosystem Member role.
          </p>
          <div className="mt-6">
            <EcosystemDownloadLink
              href="/downloads/creator-economy-stack.pdf"
              name="Creator Economy Stack"
              source="brandforge"
            />
          </div>
        </div>
      </section>

      <section className="border-t border-b1 py-12">
        <div className="content-wrap">
          <h2 className="font-mono text-[10px] uppercase tracking-wider text-muted">Discord bridge</h2>
          <ul className="mt-4 space-y-2 text-sm text-text-secondary">
            <li>· BrandForge Discord: #mxstermind-updates (read-only feed)</li>
            <li>· MXSTERMIND Discord: #brandforge-showcase</li>
            <li>· Shared role: Ecosystem Member — ask in either server</li>
          </ul>
          <a
            href={discordHref("mxm-bridge-discord")}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block rounded bg-discord px-5 py-2.5 font-mono text-[11px] font-bold text-white"
            {...ctaTrackAttrs("discord", "mxm-bridge-discord")}
          >
            Join BrandForge Discord
          </a>
        </div>
      </section>

      <FAQBlock items={ECOSYSTEM_FAQ} pageSlug="/mxstermind/" />
      <CTASection
        title="Ready for the operating layer?"
        subhead="Packages on BrandForge — Founder OS on mxstermind. We tell you honestly which fits."
        campaign="mxm-bridge-footer"
      />
    </PageShell>
  );
}
