import { MagneticButton } from "@/components/motion/MagneticButton";
import { EyebrowLabel } from "@/components/typography";
import { SITE } from "@/config/site";

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
  return (
    <header className="border-b border-b1 pb-14 pt-[120px]">
      <div className="content-wrap">
        <EyebrowLabel text={eyebrow} />
        <h1 className="mt-4 max-w-3xl text-[clamp(2rem,5vw,3.25rem)] font-bold leading-[1.08] tracking-tight">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-text-secondary">{subhead}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <MagneticButton
            href={primaryCta?.href ?? SITE.discord}
            target={primaryCta?.href?.startsWith("http") ? "_blank" : undefined}
            rel={primaryCta?.href?.startsWith("http") ? "noopener noreferrer" : undefined}
            className="rounded bg-accent px-6 py-3 text-sm font-bold text-white"
            data-cursor="hover"
          >
            {primaryCta?.label ?? "Open Discord"}
          </MagneticButton>
          <MagneticButton
            href={secondaryCta?.href ?? SITE.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded border border-b2 px-5 py-3 text-sm font-semibold text-text-secondary hover:border-[var(--a-mid)] hover:text-text"
            data-cursor="hover"
          >
            {secondaryCta?.label ?? "Message on Telegram"}
          </MagneticButton>
        </div>
      </div>
    </header>
  );
}
