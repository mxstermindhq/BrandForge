import Link from "next/link";
import {
  HERO_STATS,
  PACKAGES_LIST,
  PORTFOLIO,
  SERVICES,
  VOUCHES,
} from "@/content/home";
import { PACKAGES, SITE, telegramUrl } from "@/config/site";
import type { PackageKey } from "@/config/site";

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

function vouchStars(count: number): string {
  return "★".repeat(count) + (count < 5 ? "☆" : "");
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
          {" — built for founders, SaaS teams, and Web3 operators who want fixed USD pricing, not three vendors. Packages from $500. Quote in 24 hours."}
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="#packages"
            className="rounded bg-accent px-7 py-3.5 text-sm font-bold text-white hover:bg-accent-bright"
          >
            View packages ↓
          </Link>
          <a
            href={SITE.discord}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded border border-b2 px-6 py-3 text-sm font-semibold text-text-secondary hover:border-[var(--a-mid)] hover:text-text"
          >
            Get a quote on Discord
          </a>
        </div>
        <div className="mt-14" aria-label="BrandForge track record">
          <p className="mb-4 font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--m2)]">
            Shipped for founders and operators worldwide
          </p>
          <div className="flex flex-wrap gap-11">
            {HERO_STATS.map((stat) => (
              <div key={stat.label}>
                <div className="font-mono text-[28px] leading-none text-text">{stat.value}</div>
                <div className="mt-1 text-[11px] text-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomeServicesSectionStatic(): React.JSX.Element {
  return (
    <section id="services" className="border-y border-b1 bg-s1" aria-labelledby="services-title">
      <div className="content-wrap py-16 md:py-20">
        <SectionEyebrow>What We Do</SectionEyebrow>
        <SectionTitle id="services-title">
          Three disciplines. <em className="text-accent-bright not-italic">One team.</em>
        </SectionTitle>
        <p className="mt-4 max-w-lg text-sm text-text-secondary">
          Design, development, and growth under one roof — no handoffs, no gaps, no chasing three
          vendors.
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

export function HomePortfolioSectionStatic(): React.JSX.Element {
  return (
    <section id="portfolio" className="relative overflow-hidden py-[100px]">
      <div
        className="pointer-events-none absolute -left-1/4 top-0 h-[120%] w-1/2 opacity-30"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(124,58,237,0.12), transparent 70%)",
        }}
      />
      <div className="content-wrap relative">
        <SectionTitle>
          Work we&apos;ve <em className="text-accent-bright not-italic">shipped.</em>
        </SectionTitle>
        <p className="mt-4 max-w-lg text-sm text-text-secondary">
          Real projects. Live URLs. Verified by clients.
        </p>
        <div className="mt-12 grid gap-3.5 sm:grid-cols-2">
          {PORTFOLIO.map((item) => (
            <article
              key={item.id}
              className="relative overflow-hidden rounded-md border border-b1 bg-s1 p-6"
            >
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted">{item.tag}</p>
              <h3 className="mt-2 text-[17px] font-bold">{item.name}</h3>
              <p className="mt-2 text-xs leading-relaxed text-text-secondary">{item.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {item.chips.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-sm border border-b2 px-1.5 py-0.5 font-mono text-[9px] text-muted"
                  >
                    {chip}
                  </span>
                ))}
              </div>
              {item.href ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="mt-3 inline-block font-mono text-[10px] text-accent-bright hover:text-text"
                >
                  {item.linkLabel}
                </a>
              ) : null}
              {item.caseStudyHref ? (
                <a
                  href={item.caseStudyHref}
                  className="mt-2 block font-mono text-[10px] text-muted hover:text-accent-bright"
                >
                  Case study →
                </a>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

type StaticPackageCardProps = {
  pkg: (typeof PACKAGES_LIST)[number];
};

function StaticPackageCard({ pkg }: StaticPackageCardProps): React.JSX.Element {
  const pkgConfig = PACKAGES[pkg.key as PackageKey];

  return (
    <article
      className={`flex flex-col rounded-md border border-b1 bg-bg p-8 md:p-9 ${
        pkg.popular ? "border-accent bg-gradient-to-br from-bg to-[rgba(124,58,237,0.07)]" : ""
      }`}
    >
      {pkg.popular ? (
        <p className="mb-3 inline-block w-fit bg-accent px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-white">
          Most Popular
        </p>
      ) : null}
      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--m2)]">{pkg.tier}</p>
      <h3 className="mt-2 text-[21px] font-bold">{pkg.name}</h3>
      <p className="mt-2 text-xs leading-relaxed text-muted">{pkg.description}</p>
      <div className="mt-5 font-mono text-4xl leading-none">
        {pkg.price} <sub className="text-sm text-muted">{pkg.priceSub}</sub>
      </div>
      <p className="mt-1 font-mono text-[10px] text-muted">{pkg.range}</p>
      <p className="mt-1 font-mono text-[10px] text-accent-bright">{pkg.time}</p>
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
      <a
        href={SITE.discord}
        target="_blank"
        rel="noopener noreferrer"
        className={`mt-6 block w-full rounded border py-3 text-center text-sm font-bold transition-colors ${
          pkg.popular
            ? "border-accent bg-accent text-white hover:bg-transparent hover:text-accent-bright"
            : "border-accent text-accent-bright hover:bg-accent hover:text-white"
        }`}
      >
        {pkg.key === "growth-engine" ? "Apply on Discord →" : "Order on Discord →"}
      </a>
      <a
        href={telegramUrl(pkgConfig.telegramMsg)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 block text-center font-mono text-[10px] text-muted hover:text-[var(--tg)]"
      >
        Or order via Telegram →
      </a>
      <p className="mt-2 text-center font-mono text-[10px] text-green">{pkg.avg}</p>
    </article>
  );
}

export function HomePackagesSectionStatic(): React.JSX.Element {
  return (
    <section id="packages" className="border-t border-b1 bg-s1 py-[100px]" aria-labelledby="packages-title">
      <div className="content-wrap">
        <SectionEyebrow>Packages</SectionEyebrow>
        <SectionTitle id="packages-title">
          Pick your starting point.
        </SectionTitle>
        <p className="mt-4 max-w-lg text-sm text-text-secondary">
          Fixed price ranges — scope confirmed in 24 hours. Escrow and middleman accepted on every
          order.
        </p>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
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
    <section id="vouches" className="py-[100px]" aria-labelledby="vouches-title">
      <div className="content-wrap">
        <SectionEyebrow>Vouches</SectionEyebrow>
        <SectionTitle id="vouches-title">
          Real clients. <em className="text-accent-bright not-italic">Real words.</em>
        </SectionTitle>
        <p className="mt-4 mb-12 max-w-lg text-sm text-text-secondary">
          Unedited vouches from real clients on Discord.
        </p>
        <div className="grid gap-3.5 md:grid-cols-2 lg:grid-cols-3">
          {VOUCHES.map((vouch) => (
            <article
              key={vouch.id}
              className="relative overflow-hidden rounded-md border border-b1 bg-s1 p-6 before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-gradient-to-b before:from-accent before:to-transparent"
            >
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted">{vouch.from}</p>
              <p className="mt-2 text-xs text-[var(--amber)]" aria-label={`${vouch.stars} out of 5 stars`}>
                {vouchStars(vouch.stars)}
              </p>
              <p className="mt-3 text-[13px] italic leading-relaxed text-text-secondary">
                &ldquo;{vouch.text}&rdquo;
              </p>
              <footer className="mt-4">
                <cite className="font-mono text-[10px] not-italic text-text">{vouch.who}</cite>
                {vouch.amount ? (
                  <p className="mt-1 font-mono text-[9px] text-green">{vouch.amount}</p>
                ) : null}
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Core home sections — fully server-rendered for zero CLS and minimal JS. */
export function HomeCoreSections(): React.JSX.Element {
  return (
    <>
      <HomeServicesSectionStatic />
      <HomePortfolioSectionStatic />
      <HomePackagesSectionStatic />
      <HomeVouchesSectionStatic />
    </>
  );
}
