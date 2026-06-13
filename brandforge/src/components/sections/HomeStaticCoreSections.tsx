import { VouchCarousel } from "@/components/content/VouchCard";
import { AbHeroPrimaryCta } from "@/components/marketing/AbHeroPrimaryCta";
import { AnimatedHeroStats } from "@/components/marketing/AnimatedHeroStats";
import { CopyInviteButton } from "@/components/marketing/CopyInviteButton";
import { StartPackageButton } from "@/components/marketing/StartPackageButton";
import { HERO_STATS, PACKAGES_LIST, SERVICES, VOUCHES } from "@/content/home";
import { PACKAGES } from "@/config/site";
import type { PackageKey } from "@/config/site";
import { ctaTrackAttrs, telegramHref } from "@/lib/tracking";

function SectionEyebrow({ children }: { children: string }): React.JSX.Element {
  return (
    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-bright">{children}</p>
  );
}

function SectionTitle({
  id,
  children,
}: {
  id?: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <h2
      id={id}
      className="mt-3 text-[clamp(28px,4vw,48px)] font-bold leading-[1.1] tracking-tight"
    >
      {children}
    </h2>
  );
}

export function HomeHeroStatic(): React.JSX.Element {
  return (
    <section
      id="hero"
      className="relative flex min-h-screen flex-col justify-center overflow-hidden pt-[120px] pb-20"
    >
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 55% 55% at 15% 50%, rgba(124,58,237,0.13), transparent 60%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 35% 35% at 85% 20%, rgba(124,58,237,0.07), transparent 60%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
        style={{
          backgroundImage:
            "linear-gradient(rgba(124,58,237,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.055) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 80% 70% at 50% 40%, black 10%, transparent 70%)",
        }}
      />

      <div className="content-wrap relative">
        <SectionEyebrow>Design · Development · Growth</SectionEyebrow>
        <h1 className="mt-4 max-w-4xl text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[1.05] tracking-tight">
          <span className="block">
            We <span className="text-accent-bright">Build,</span> Optimise
          </span>
          <span className="block">
            <span className="font-light">&amp; Grow</span> Brands.
          </span>
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-text-secondary">
          <strong className="font-semibold text-text">One studio for brand, website, and growth</strong>
          {" — built for founders, SaaS teams, and Web3 operators who want fixed USD pricing, not three vendors. Packages from $300. Quote in 24 hours."}
        </p>
        <AbHeroPrimaryCta />
        <AnimatedHeroStats stats={HERO_STATS} />
      </div>
    </section>
  );
}

export function HomeServicesSectionStatic(): React.JSX.Element {
  return (
    <section id="services" className="bf-below-fold border-y border-b1 bg-s1" aria-labelledby="services-title">
      <div className="content-wrap py-16 md:py-20">
        <SectionEyebrow>What We Do</SectionEyebrow>
        <SectionTitle id="services-title">
          Three disciplines. <em className="text-accent-bright not-italic">One team.</em>
        </SectionTitle>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-text-secondary">
          Design, development, and growth under one roof — no handoffs, no gaps, no chasing three
          vendors. We are a <strong className="font-semibold text-text">development-first squad</strong>{" "}
          that builds, automates, and scales your digital ecosystem.
        </p>
      </div>
      <div className="content-wrap grid gap-4 pb-16 md:grid-cols-3">
        {SERVICES.map((svc) => (
          <article key={svc.id} className="rounded-md border border-b1 bg-bg p-8 md:p-10">
            <p className="font-mono text-[9px] tracking-[0.14em] text-[var(--m2)]">{svc.num}</p>
            <p className="mt-5 text-2xl" aria-hidden="true">
              {svc.icon}
            </p>
            <h3 className="mt-3 text-lg font-bold">{svc.title}</h3>
            <ul className="mt-4 space-y-0">
              {svc.items.map((item) => (
                <li
                  key={item}
                  className="border-b border-b1 py-2 pl-4 text-xs text-muted last:border-b-0"
                >
                  <span className="relative before:absolute before:-left-0 before:font-mono before:text-[10px] before:text-accent-bright before:content-['→']">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

type StaticPackageCardProps = {
  pkg: (typeof PACKAGES_LIST)[number];
};

function packageBadgeLabel(pkg: (typeof PACKAGES_LIST)[number]): string | null {
  if (pkg.popular && pkg.key === "automator") return "Most popular";
  if (pkg.popular) return "Enterprise tier";
  return null;
}

function StaticPackageCard({ pkg }: StaticPackageCardProps): React.JSX.Element {
  const pkgConfig = PACKAGES[pkg.key as PackageKey];
  const campaign = `package-${pkg.key}`;
  const badge = packageBadgeLabel(pkg);

  return (
    <article
      className={`flex flex-col rounded-md border border-b1 bg-bg p-8 md:p-9 ${
        pkg.popular ? "border-accent bg-gradient-to-br from-bg to-[rgba(124,58,237,0.07)]" : ""
      } ${pkg.slotLimited ? "ring-1 ring-amber/30" : ""}`}
    >
      {badge ? (
        <p className="mb-3 inline-block w-fit bg-accent px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-white">
          {badge}
        </p>
      ) : null}
      {pkg.slotLimited ? (
        <p className="mb-3 inline-block w-fit bg-amber/15 px-2.5 py-1 font-mono text-[9px] font-semibold uppercase tracking-wider text-amber">
          Limited slots
        </p>
      ) : null}
      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--m2)]">{pkg.tier}</p>
      <h3 className="mt-2 text-[21px] font-bold">{pkg.name}</h3>
      <p className="mt-2 text-xs leading-relaxed text-accent-bright">{pkg.valueProposition}</p>
      <div className="mt-5 font-mono text-4xl leading-none">
        {pkg.price} <sub className="text-sm text-muted">{pkg.priceSub}</sub>
      </div>
      <p className="mt-2 font-mono text-[10px] text-muted">{pkg.availability}</p>
      <p className="mt-1 font-mono text-[10px] text-accent-bright">{pkg.time}</p>
      <p className="mt-3 rounded border border-b1 bg-s2 p-3 text-[11px] leading-snug text-text-secondary">
        <span className="font-semibold text-text">Capacity: </span>
        {pkg.capacityLimit}
      </p>
      <ul className="mt-5 flex-1 space-y-0 border-t border-b1 pt-4">
        {pkg.features.map((feat) => (
          <li
            key={feat}
            className={`border-b border-b1 py-2 pl-4 text-xs last:border-b-0 ${
              feat.includes("not included") ? "text-[var(--m2)]" : "text-text-secondary"
            }`}
          >
            <span className="relative before:absolute before:-left-0 before:font-mono before:text-[10px] before:text-accent-bright before:content-['→']">
              {feat}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 font-mono text-[9px] leading-snug text-muted">{pkg.handoff}</p>
      <div className="mt-6 flex flex-col gap-2">
        <StartPackageButton packageKey={pkg.key as PackageKey} />
        <CopyInviteButton campaign={`home-package-${pkg.key}-copy`} className="w-full justify-center" />
      </div>
      <a
        href={telegramHref(pkgConfig.telegramMsg, campaign)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 block text-center font-mono text-[10px] text-muted hover:text-[var(--tg)]"
        {...ctaTrackAttrs("telegram", campaign)}
      >
        Or order via Telegram →
      </a>
      <p className="mt-2 text-center font-mono text-[10px] text-green">{pkg.avg}</p>
    </article>
  );
}

export function HomePackagesSectionStatic(): React.JSX.Element {
  return (
    <section id="packages" className="bf-below-fold border-t border-b1 bg-s1 py-[100px]" aria-labelledby="packages-title">
      <div className="content-wrap">
        <SectionEyebrow>Packages</SectionEyebrow>
        <SectionTitle id="packages-title">
          The 5 <em className="text-accent-bright not-italic">Packages.</em>
        </SectionTitle>
        <p className="mt-4 max-w-2xl text-sm text-text-secondary">
          From one-time blueprint to enterprise retainer — fixed USD, capacity limits per tier, quote
          in 24 hours. Escrow and middleman accepted on every order.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {PACKAGES_LIST.map((pkg) => (
            <StaticPackageCard key={pkg.key} pkg={pkg} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomeVouchesSectionStatic(): React.JSX.Element {
  return (
    <section id="vouches" className="bf-below-fold py-[100px]" aria-labelledby="vouches-title">
      <div className="content-wrap">
        <SectionEyebrow>Vouches</SectionEyebrow>
        <SectionTitle id="vouches-title">
          Real clients. <em className="text-accent-bright not-italic">Real words.</em>
        </SectionTitle>
        <p className="mt-4 mb-12 max-w-lg text-sm text-text-secondary">
          Unedited vouches from real clients on Discord.
        </p>
        <VouchCarousel vouches={VOUCHES} />
      </div>
    </section>
  );
}

/** Core home sections — fully server-rendered for zero CLS and minimal JS. */
export function HomeCoreSections(): React.JSX.Element {
  return (
    <>
      <HomeServicesSectionStatic />
      <HomePackagesSectionStatic />
      <HomeVouchesSectionStatic />
    </>
  );
}
