import type { Metadata } from "next";
import { PageHero, PageShell } from "@/components/content";
import { ctaTrackAttrs, discordHref } from "@/lib/tracking";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: "Community Showcase — BrandForge",
    description: "Client projects and community submissions using BrandForge assets and templates.",
    path: "/community/",
  }),
};

const SHOWCASE = [
  {
    name: "Forum Commerce Hub",
    by: "BrandForge delivery",
    href: "/portfolio/forum-commerce-hub/",
  },
  {
    name: "Community Launch Kit",
    by: "BrandForge delivery",
    href: "/portfolio/community-launch-kit/",
  },
  {
    name: "Drain.cx storefront",
    by: "BrandForge delivery",
    href: "/portfolio/drain-cx/",
  },
] as const;

export default function CommunityPage(): React.JSX.Element {
  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Community", href: "/community/" },
      ]}
      path="/community/"
    >
      <PageHero
        eyebrow="Community"
        title={
          <>
            Built with BrandForge. <em className="text-accent-bright not-italic">Shown with pride.</em>
          </>
        }
        subhead="Submit your project on Discord — monthly Best Rebrand vote in the community."
      />

      <section className="py-16">
        <div className="content-wrap grid gap-4 sm:grid-cols-3">
          {SHOWCASE.map((s) => (
            <a
              key={s.name}
              href={s.href}
              className="rounded-md border border-b1 bg-s1 p-6 hover:border-accent"
            >
              <p className="font-bold">{s.name}</p>
              <p className="mt-2 font-mono text-[10px] text-muted">{s.by}</p>
            </a>
          ))}
        </div>
        <a
          href={discordHref("community-submit")}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-block rounded bg-discord px-5 py-2.5 font-mono text-[11px] font-bold text-white"
          {...ctaTrackAttrs("discord", "community-submit")}
        >
          Submit your project
        </a>
      </section>

      <section className="border-t border-b1 py-12">
        <div className="content-wrap text-sm text-text-secondary">
          <h2 className="text-lg font-bold text-text">Template marketplace</h2>
          <p className="mt-2">
            Submit templates for review — 70% creator / 30% BrandForge. See /store/ for live products.
          </p>
        </div>
      </section>
    </PageShell>
  );
}
