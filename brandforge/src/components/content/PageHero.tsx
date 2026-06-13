import Link from "next/link";
import { ctaTrackAttrs, discordHref, telegramHref } from "@/lib/tracking";

type PageHeroProps = {
  eyebrow: string;
  title: React.ReactNode;
  subhead: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
};

/** Standard inner-page hero — outcome-led headline + Discord/Telegram CTAs. */
export function PageHero({
  eyebrow,
  title,
  subhead,
  primaryCta,
  secondaryCta,
}: PageHeroProps): React.JSX.Element {
  const primaryHref = primaryCta?.href ?? discordHref("page-hero");
  const primaryLabel = primaryCta?.label ?? "Open Discord";
  const primaryClassName =
    "rounded bg-accent px-6 py-3 text-sm font-bold text-white hover:bg-accent-bright";
  const isExternalPrimary = primaryHref.startsWith("http");

  return (
    <header className="border-b border-b1 pb-14 pt-[120px]">
      <div className="content-wrap">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-bright">{eyebrow}</p>
        <h1 className="mt-4 max-w-3xl text-[clamp(2rem,5vw,3.25rem)] font-bold leading-[1.08] tracking-tight">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-text-secondary">{subhead}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          {isExternalPrimary ? (
            <a
              href={primaryHref}
              target="_blank"
              rel="noopener noreferrer"
              className={primaryClassName}
              {...(primaryCta ? {} : ctaTrackAttrs("discord", "page-hero"))}
            >
              {primaryLabel}
            </a>
          ) : (
            <Link href={primaryHref} className={primaryClassName}>
              {primaryLabel}
            </Link>
          )}
          <a
            href={secondaryCta?.href ?? telegramHref("Hi BrandForge — I'd like a quote.", "page-hero")}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded border border-b2 px-5 py-3 text-sm font-semibold text-text-secondary hover:border-[var(--a-mid)] hover:text-text"
            {...(secondaryCta ? {} : ctaTrackAttrs("telegram", "page-hero"))}
          >
            {secondaryCta?.label ?? "Message on Telegram"}
          </a>
        </div>
      </div>
    </header>
  );
}
