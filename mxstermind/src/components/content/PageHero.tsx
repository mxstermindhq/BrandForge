import Link from "next/link";
import { SITE } from "@/config/site";

type PageHeroProps = {
  eyebrow: string;
  title: React.ReactNode;
  subhead: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
};

/** Editorial inner-page hero — outcome-led headline + Discord/Telegram CTAs. */
export function PageHero({
  eyebrow,
  title,
  subhead,
  primaryCta,
  secondaryCta,
}: PageHeroProps): React.JSX.Element {
  const primaryHref = primaryCta?.href ?? SITE.discord;
  const secondaryHref = secondaryCta?.href ?? SITE.telegram;
  const primaryExternal = primaryHref.startsWith("http");
  const secondaryExternal = secondaryHref.startsWith("http");

  return (
    <header className="border-b border-b1 pb-14 pt-[120px]">
      <div className="content-wrap">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-bright">{eyebrow}</p>
        <h1 className="mt-4 max-w-3xl font-serif text-[clamp(2.25rem,5vw,3.5rem)] font-light leading-[1.12] tracking-tight">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-text-secondary">{subhead}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={primaryHref}
            target={primaryExternal ? "_blank" : undefined}
            rel={primaryExternal ? "noopener noreferrer" : undefined}
            className="rounded-sm bg-accent px-6 py-3 font-mono text-[11px] font-bold uppercase tracking-wider text-bg"
          >
            {primaryCta?.label ?? "Open Discord"}
          </Link>
          <Link
            href={secondaryHref}
            target={secondaryExternal ? "_blank" : undefined}
            rel={secondaryExternal ? "noopener noreferrer" : undefined}
            className="rounded-sm border border-b2 px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-text-secondary hover:border-accent hover:text-text"
          >
            {secondaryCta?.label ?? "Message on Telegram"}
          </Link>
        </div>
      </div>
    </header>
  );
}
