import type { Metadata } from "next";
import { CTASection, PageHero, PageShell } from "@/components/content";
import { ctaTrackAttrs, discordHref } from "@/lib/tracking";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Events & Workshops — BrandForge",
  description: "Monthly branding workshops, office hours, and Discord Stage sessions for operators.",
  path: "/events/",
});

const UPCOMING = [
  {
    title: "Branding Workshop — Discord Launch in 10 Days",
    date: "2026-06-27T18:00:00Z",
    format: "Discord Stage",
    register: "events-workshop-june",
  },
  {
    title: "Office Hours — Open Q&A",
    date: "2026-07-04T17:00:00Z",
    format: "Discord Voice",
    register: "events-office-hours-july",
  },
] as const;

export default function EventsPage(): React.JSX.Element {
  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Events", href: "/events/" },
      ]}
      path="/events/"
    >
      <PageHero
        eyebrow="Events"
        title={
          <>
            Learn live. <em className="text-accent-bright not-italic">Ask anything.</em>
          </>
        }
        subhead="Monthly workshops and office hours — register via Discord role."
      />

      <section className="py-16">
        <div className="content-wrap space-y-6">
          <h2 className="text-lg font-bold">Upcoming</h2>
          {UPCOMING.map((e) => (
            <article key={e.title} className="rounded-md border border-b1 bg-s1 p-6">
              <p className="font-mono text-[10px] text-muted">
                {new Date(e.date).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })} ·{" "}
                {e.format}
              </p>
              <h3 className="mt-2 font-bold">{e.title}</h3>
              <a
                href={discordHref(e.register)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block font-mono text-[11px] text-accent-bright"
                {...ctaTrackAttrs("discord", e.register)}
              >
                Register on Discord →
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-b1 bg-s1 py-12">
        <div className="content-wrap">
          <h2 className="text-lg font-bold">Past recordings</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Pro members get workshop replays in Discord. Insider tier gets select highlights.
          </p>
        </div>
      </section>

      <CTASection title="Want a private workshop?" subhead="Scoped for teams — Discord intake." campaign="events-footer" />
    </PageShell>
  );
}
