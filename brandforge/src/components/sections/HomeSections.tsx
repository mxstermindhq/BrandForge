"use client";

import Link from "next/link";
import {
  EyebrowLabel,
  HeroLine,
  HeroSubheading,
  KineticHero,
  SectionHeading,
  SectionLine,
} from "@/components/typography";
import { SITE } from "@/config/site";

export function HomeHero(): React.JSX.Element {
  return (
    <section className="relative flex min-h-screen flex-col justify-center overflow-hidden pt-[120px] pb-20">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_55%_at_15%_50%,rgba(124,58,237,0.13),transparent_60%),radial-gradient(ellipse_35%_35%_at_85%_20%,rgba(124,58,237,0.07),transparent_60%)]"
        aria-hidden
      />
      <div className="content-wrap relative">
        <EyebrowLabel text="Design · Development · Growth" />
        <KineticHero ariaLabel="We Build, Optimise and Grow Brands.">
          <HeroLine>
            We <span className="text-accent-bright">Build,</span> Optimise
          </HeroLine>
          <HeroLine>
            <span className="font-light">&amp; Grow</span> Brands.
          </HeroLine>
        </KineticHero>
        <HeroSubheading
          boldPrefix="One studio for brand, website, and growth"
          text=" — built for founders, SaaS teams, and Web3 operators who want fixed USD pricing, not three vendors. Packages from $500. Quote in 24 hours."
        />
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="#packages"
            className="inline-flex items-center rounded bg-accent px-7 py-3.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 hover:shadow-[0_10px_30px_var(--a-glow)]"
          >
            View packages ↓
          </Link>
          <a
            href={SITE.discord}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded border border-b2 px-6 py-3 text-sm font-semibold text-text-secondary transition-colors hover:border-[var(--a-mid)] hover:text-text"
          >
            Get a quote on Discord
          </a>
        </div>
      </div>
    </section>
  );
}

export function HomeSections(): React.JSX.Element {
  return (
    <>
      <section id="packages" className="border-t border-b1 bg-s1 py-[100px]">
        <div className="content-wrap">
          <EyebrowLabel text="Packages" className="mb-3" delay={0} />
          <SectionHeading className="mt-0">
            <SectionLine>Pick your starting point.</SectionLine>
          </SectionHeading>
          <p className="mt-4 max-w-lg text-sm text-text-secondary">
            Fixed price ranges — scope confirmed in 24 hours. Escrow and middleman accepted on every
            order.
          </p>
          <div className="mt-16 grid gap-4 md:grid-cols-3">
            {(["Brand Sprint", "Launch Stack", "Growth Engine"] as const).map((name) => (
              <article
                key={name}
                className="rounded-md border border-b1 bg-bg p-8 transition-transform hover:-translate-y-1 hover:border-[var(--a-mid)]"
              >
                <h3 className="text-xl font-bold">{name}</h3>
                <p className="mt-2 text-xs text-muted">Phase 3 — scroll-driven card stack.</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="portfolio" className="py-[100px]">
        <div className="content-wrap">
          <SectionHeading scrub>
            <SectionLine>
              Work we&apos;ve <em className="text-accent-bright not-italic">shipped.</em>
            </SectionLine>
          </SectionHeading>
          <ul className="mt-8 flex flex-wrap gap-4 font-mono text-xs text-text-secondary">
            <li>cascade.markets</li>
            <li>drain.cx</li>
            <li>CarSpot Live</li>
            <li>dyotravel.com</li>
          </ul>
        </div>
      </section>
    </>
  );
}
