import type { Metadata } from "next";
import { CTASection, FAQBlock, PageHero, PageShell } from "@/components/content";
import { PACKAGES } from "@/config/site";
import { SITE, telegramUrl } from "@/config/site";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact BrandForge — Discord & Telegram",
  description:
    "Contact BrandForge on Discord or Telegram only. Fixed quote in 24 hours. No contact forms. Escrow and crypto accepted.",
  path: "/contact/",
});

const CONTACT_FAQ = [
  {
    question: "How do I contact BrandForge?",
    answer:
      "Open Discord at discord.gg/a8Nz2R6M55 or message Telegram @Notmxstermind. Those are the only official channels. We do not use contact forms or Calendly — scope discussion happens in chat.",
  },
  {
    question: "What should I include in my first message?",
    answer:
      "Send your goal, deadline, budget range, and 1–3 reference links. Mention if you need escrow. BrandForge replies within 24 hours with a fixed USD quote or clarifying questions.",
  },
  {
    question: "Does BrandForge offer phone or video calls?",
    answer:
      "Calls are available for Growth Engine and larger scopes after initial chat. Package buyers typically close scope in Discord/Telegram without meetings — faster for operators in different time zones.",
  },
  {
    question: "Can I reach BrandForge for support after delivery?",
    answer:
      "Yes. Launch Stack includes 30-day post-launch support. Growth Engine includes ongoing monthly access. Support stays on the same Discord/Telegram thread — no ticket portal.",
  },
] as const;

export default function ContactPage(): React.JSX.Element {
  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Contact", href: "/contact/" },
      ]}
      path="/contact/"
      faqs={CONTACT_FAQ}
    >
      <PageHero
        eyebrow="Contact"
        title={
          <>
            Discord or Telegram. <em className="text-accent-bright not-italic">That&apos;s it.</em>
          </>
        }
        subhead="No forms. No calendar links. Send scope, get a fixed USD quote within 24 hours."
      />

      <section className="py-16">
        <div className="content-wrap grid gap-6 md:grid-cols-2">
          <a
            href={SITE.discord}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-b1 bg-s1 p-8 transition-colors hover:border-discord"
            data-cursor="hover"
          >
            <p className="font-mono text-[10px] uppercase tracking-wider text-discord">Primary</p>
            <h2 className="mt-2 text-2xl font-bold">Discord</h2>
            <p className="mt-3 text-sm text-text-secondary">
              Best for forum operators, gaming communities, and Web3 founders. Join the server and open a
              ticket or DM with your scope.
            </p>
            <p className="mt-4 font-mono text-[11px] text-accent-bright">discord.gg/a8Nz2R6M55 →</p>
          </a>
          <a
            href={telegramUrl(PACKAGES.custom.telegramMsg)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-b1 bg-s1 p-8 transition-colors hover:border-telegram"
            data-cursor="hover"
          >
            <p className="font-mono text-[10px] uppercase tracking-wider text-telegram">Alternative</p>
            <h2 className="mt-2 text-2xl font-bold">Telegram</h2>
            <p className="mt-3 text-sm text-text-secondary">
              Same team, same 24-hour quote turnaround. Useful if you already run your business on Telegram.
            </p>
            <p className="mt-4 font-mono text-[11px] text-accent-bright">@Notmxstermind →</p>
          </a>
        </div>
        <p className="content-wrap mt-10 max-w-2xl text-sm text-text-secondary">
          Premium bespoke engagements above package scope:{" "}
          <a href={SITE.premium} className="text-accent-bright">
            mxstermind.com
          </a>
        </p>
      </section>

      <FAQBlock items={CONTACT_FAQ} />
      <CTASection
        title="Waiting costs less than a bad hire"
        subhead="Message now — fixed quote in 24 hours."
        discordLabel="Open Discord"
        telegramLabel="Open Telegram"
      />
    </PageShell>
  );
}
