import { CopyInviteButton } from "@/components/marketing/CopyInviteButton";
import { ctaTrackAttrs, discordHref, telegramHref } from "@/lib/tracking";

type InlineCTAProps = {
  headline?: string;
  subhead?: string;
  campaign?: string;
};

/** Mid-page conversion block for blog posts and long pages. */
export function InlineCTA({
  headline = "Want this on your project?",
  subhead = "DM us on Discord or Telegram — fixed quote in 24 hours.",
  campaign = "inline-cta",
}: InlineCTAProps): React.JSX.Element {
  return (
    <aside className="content-wrap my-12 rounded-md border border-accent/30 bg-gradient-to-br from-s1 to-bg p-8">
      <h3 className="text-lg font-bold text-text">{headline}</h3>
      <p className="mt-2 max-w-xl text-sm text-text-secondary">{subhead}</p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <a
          href={discordHref(campaign)}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded bg-discord px-6 py-3 font-mono text-[11px] font-bold text-white"
          {...ctaTrackAttrs("discord", campaign)}
        >
          Get a quote on Discord
        </a>
        <a
          href={telegramHref("Hi BrandForge — I'd like a quote.", campaign)}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded border border-b2 px-5 py-3 font-mono text-[11px] font-semibold text-text-secondary"
          {...ctaTrackAttrs("telegram", campaign)}
        >
          Message on Telegram
        </a>
        <CopyInviteButton campaign={`${campaign}-copy`} />
      </div>
    </aside>
  );
}
