import { SITE } from "@/config/site";

/** Persistent Discord + Telegram strip — visible on every page below the header. */
export function ContactActionBar(): React.JSX.Element {
  return (
    <div
      className="fixed inset-x-0 top-14 z-[290] border-b border-b1 bg-bg/95 backdrop-blur-md"
      aria-label="Contact BrandForge"
    >
      <div className="content-wrap flex flex-wrap items-center justify-between gap-2 py-2">
        <p className="hidden font-mono text-[9px] uppercase tracking-wider text-muted sm:block">
          Fixed quote in 24h · Escrow accepted
        </p>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
          <a
            href={SITE.discord}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded bg-discord px-4 py-2 text-center font-mono text-[10px] font-bold text-white sm:flex-none"
          >
            Get a quote on Discord
          </a>
          <a
            href={SITE.discord}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded border border-discord/40 bg-discord/10 px-4 py-2 text-center font-mono text-[10px] font-semibold text-white sm:flex-none"
          >
            Open Discord
          </a>
          <a
            href={SITE.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded border border-b2 px-4 py-2 text-center font-mono text-[10px] font-semibold text-text-secondary hover:text-text sm:flex-none"
          >
            Telegram
          </a>
        </div>
      </div>
    </div>
  );
}
