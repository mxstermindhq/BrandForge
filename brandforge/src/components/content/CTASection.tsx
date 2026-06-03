import { SITE } from "@/config/site";

type CTASectionProps = {
  title: React.ReactNode;
  subhead: string;
  discordLabel?: string;
  telegramLabel?: string;
};

/** Closing CTA — Discord + Telegram only, no forms. */
export function CTASection({
  title,
  subhead,
  discordLabel = "Open Discord",
  telegramLabel = "Message on Telegram",
}: CTASectionProps): React.JSX.Element {
  return (
    <section className="border-t border-b1 bg-s1 py-[var(--spacing-section)]" aria-labelledby="cta-title">
      <div className="content-wrap text-center">
        <h2 id="cta-title" className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold">
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm text-text-secondary">{subhead}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href={SITE.discord}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded bg-discord px-7 py-3.5 font-mono text-[11px] font-bold text-white"
          >
            {discordLabel}
          </a>
          <a
            href={SITE.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded border border-b2 px-6 py-3.5 font-mono text-[11px] font-semibold text-text-secondary hover:text-text"
          >
            {telegramLabel}
          </a>
        </div>
        <p className="mt-6 font-mono text-[10px] text-muted">
          Fixed quote within 24 hours · Escrow and crypto accepted
        </p>
      </div>
    </section>
  );
}
