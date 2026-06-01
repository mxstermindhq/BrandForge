"use client";

import { MagneticButton } from "@/components/motion/MagneticButton";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { HeroStats } from "@/components/sections/HeroStats";
import {
  EyebrowLabel,
  HeroLine,
  HeroSubheading,
  KineticHero,
} from "@/components/typography";
import { PackageStackSection } from "@/components/sections/PackageStackSection";
import { PortfolioSection } from "@/components/sections/PortfolioSection";
import { ServicesPinSection } from "@/components/sections/ServicesPinSection";
import { VouchesSection } from "@/components/sections/VouchesSection";
import { SITE } from "@/config/site";
import { gsap, registerGsapPlugins } from "@/lib/gsap/register-plugins";
import { useReducedMotion } from "@/lib/motion/prefers-reduced-motion";

export function HomeHero(): React.JSX.Element {
  const sectionRef = useRef<HTMLElement>(null);
  const layerSlowRef = useRef<HTMLDivElement>(null);
  const layerMidRef = useRef<HTMLDivElement>(null);
  const layerFastRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      registerGsapPlugins();
      const section = sectionRef.current;
      if (!section || reducedMotion) return;

      const layers: Array<{ el: HTMLDivElement | null; factor: number }> = [
        { el: layerSlowRef.current, factor: 0.3 },
        { el: layerMidRef.current, factor: 0.6 },
        { el: layerFastRef.current, factor: 1 },
      ];

      layers.forEach(({ el, factor }) => {
        if (!el) return;
        gsap.to(el, {
          yPercent: 28 * factor,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      });

      return () => {
        layers.forEach(({ el }) => {
          if (el) gsap.killTweensOf(el);
        });
      };
    },
    { scope: sectionRef, dependencies: [reducedMotion] },
  );

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative flex min-h-screen flex-col justify-center overflow-hidden pt-[120px] pb-20"
    >
      <div
        ref={layerSlowRef}
        className="pointer-events-none absolute inset-0 will-change-transform"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 55% 55% at 15% 50%, rgba(124,58,237,0.13), transparent 60%)",
        }}
      />
      <div
        ref={layerMidRef}
        className="pointer-events-none absolute inset-0 will-change-transform"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 35% 35% at 85% 20%, rgba(124,58,237,0.07), transparent 60%)",
        }}
      />
      <div
        ref={layerFastRef}
        className="pointer-events-none absolute inset-0 will-change-transform opacity-40"
        aria-hidden
        style={{
          backgroundImage:
            "linear-gradient(rgba(124,58,237,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.055) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 80% 70% at 50% 40%, black 10%, transparent 70%)",
        }}
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
          <MagneticButton
            asChild
            href="#packages"
            className="rounded bg-accent px-7 py-3.5 text-sm font-bold text-white shadow-none hover:shadow-[0_10px_30px_var(--a-glow)]"
            data-cursor="hover"
          >
            View packages ↓
          </MagneticButton>
          <MagneticButton
            href={SITE.discord}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded border border-b2 px-6 py-3 text-sm font-semibold text-text-secondary hover:border-[var(--a-mid)] hover:text-text"
            data-cursor="hover"
          >
            Get a quote on Discord
          </MagneticButton>
        </div>
        <HeroStats />
      </div>
    </section>
  );
}

export function HomeSections(): React.JSX.Element {
  return (
    <>
      <ServicesPinSection />
      <PortfolioSection />
      <PackageStackSection />
      <VouchesSection />
    </>
  );
}
