import { CalendlyEmbed } from "@/components/marketing/CalendlyEmbed";
import { CopyInviteButton } from "@/components/marketing/CopyInviteButton";
import { ctaTrackAttrs, discordHref, telegramHref } from "@/lib/tracking";

type CTASectionProps = {
  title: React.ReactNode;
  subhead: string;
  discordLabel?: string;
  telegramLabel?: string;
  campaign?: string;
  showCopyInvite?: boolean;
  showCalendly?: boolean;
};

/** Closing CTA — Discord + Telegram only, no forms. */
export function CTASection({
  title,
  subhead,
  discordLabel = "Open Discord",
  telegramLabel = "Message on Telegram",
  campaign = "cta-section",
  showCopyInvite = true,
  showCalendly = false,
}: CTASectionProps): React.JSX.Element {
  return (
    <section className="border-t border-b1 bg-s1 py-[var(--spacing-section)]" aria-labelledby="cta-title">
      <div className="content-wrap text-center">
        <h2 id="cta-title" className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold">
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm text-text-secondary">{subhead}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href={discordHref(campaign)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded bg-discord px-7 py-3.5 font-mono text-[11px] font-bold text-white"
            {...ctaTrackAttrs("discord", campaign)}
          >
            {discordLabel}
          </a>
          <a
            href={telegramHref("Hi BrandForge — I'd like a quote.", campaign)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded border border-b2 px-6 py-3.5 font-mono text-[11px] font-semibold text-text-secondary hover:text-text"
            {...ctaTrackAttrs("telegram", campaign)}
          >
            {telegramLabel}
          </a>
          {showCopyInvite ? <CopyInviteButton campaign={`${campaign}-copy`} /> : null}
        </div>
        <p className="mt-6 font-mono text-[10px] text-muted">
          Fixed quote within 24 hours · Escrow and crypto accepted
        </p>
        {showCalendly ? (
          <div id="calendly-scope" className="mx-auto mt-10 max-w-3xl text-left">
            <CalendlyEmbed campaign={`${campaign}-calendly`} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
