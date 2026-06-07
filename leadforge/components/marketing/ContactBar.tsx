import { LEADFORGE_TELEGRAM_MSG, SITE, telegramUrl } from "@/lib/site";

/** Discord + Telegram strip — same channels as BrandForge. */
export function ContactBar(): React.JSX.Element {
  return (
    <div
      className="sticky top-[60px] z-40 border-b border-border bg-bg/95 backdrop-blur-md"
      aria-label="Contact LeadForge"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-6 py-2">
        <p className="hidden font-mono text-[9px] uppercase tracking-wider text-tx-muted sm:block">
          Questions? Same team as BrandForge · Reply on Discord or Telegram
        </p>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
          <a
            href={`${SITE.discord}?leadforge`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded bg-[#5865F2] px-4 py-2 text-center font-mono text-[10px] font-bold text-white transition hover:bg-[#4752c4] sm:flex-none"
          >
            Chat on Discord
          </a>
          <a
            href={telegramUrl(LEADFORGE_TELEGRAM_MSG)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded border border-border px-4 py-2 text-center font-mono text-[10px] font-semibold text-tx-muted transition hover:border-border-hover hover:text-tx sm:flex-none"
          >
            Telegram
          </a>
        </div>
      </div>
    </div>
  );
}

export function ContactCTA({ className = "" }: { className?: string }): React.JSX.Element {
  return (
    <div className={`flex flex-wrap justify-center gap-3 ${className}`}>
      <a
        href={SITE.discord}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded bg-[#5865F2] px-5 py-2.5 font-mono text-xs font-bold text-white hover:bg-[#4752c4]"
      >
        Get help on Discord
      </a>
      <a
        href={telegramUrl(LEADFORGE_TELEGRAM_MSG)}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded border border-border px-5 py-2.5 font-mono text-xs text-tx-muted hover:border-border-hover hover:text-tx"
      >
        Message on Telegram
      </a>
    </div>
  );
}
