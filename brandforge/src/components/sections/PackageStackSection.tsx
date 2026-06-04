"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { PACKAGES_LIST } from "@/content/home";
import type { PackageKey } from "@/config/site";
import { SITE, telegramUrl, PACKAGES } from "@/config/site";
import { useIsMobile } from "@/hooks/use-media-query";
import { gsap, registerGsapPlugins } from "@/lib/gsap/register-plugins";
import { EASE_KINETIC } from "@/lib/motion/easing";
import { useSkipMotion, useMotionInView } from "@/lib/motion/prefers-reduced-motion";
import { EyebrowLabel, SectionHeading, SectionLine } from "@/components/typography";

export function PackageStackSection(): React.JSX.Element {
  const sectionRef = useRef<HTMLElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const skipMotion = useSkipMotion();
  const isMobile = useIsMobile();
  const motionReady = useMotionInView(sectionRef);

  useGSAP(
    () => {
      registerGsapPlugins();
      const section = sectionRef.current;
      const stack = stackRef.current;
      if (!section || !stack || skipMotion || isMobile || !motionReady) return;

      const cards = gsap.utils.toArray<HTMLElement>("[data-pkg-card]", stack);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          pin: stack,
          start: "top top",
          end: () => `+=${window.innerHeight * (cards.length - 0.35)}`,
          scrub: 0.65,
          anticipatePin: 1,
        },
      });

      cards.forEach((card, index) => {
        if (index === 0) return;

        tl.fromTo(
          card,
          { yPercent: 55, scale: 0.94, opacity: 0 },
          { yPercent: 0, scale: 1, opacity: 1, ease: EASE_KINETIC, duration: 1 },
          index * 0.85,
        );

        const prev = cards[index - 1];
        if (prev) {
          tl.to(
            prev,
            {
              scale: 0.9,
              opacity: 0.35,
              filter: "blur(10px)",
              yPercent: -8,
              ease: "none",
              duration: 0.85,
            },
            "<",
          );
        }
      });

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    },
    { scope: sectionRef, dependencies: [skipMotion, isMobile, motionReady] },
  );

  useGSAP(
    () => {
      if (skipMotion || !isMobile || !motionReady) return;
      const cards = gsap.utils.toArray<HTMLElement>("[data-pkg-card]");
      gsap.fromTo(
        cards,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          ease: EASE_KINETIC,
          stagger: 0.15,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            once: true,
          },
        },
      );
    },
    { scope: sectionRef, dependencies: [skipMotion, isMobile, motionReady] },
  );

  return (
    <section
      ref={sectionRef}
      id="packages"
      className="border-t border-b1 bg-s1 py-16 md:py-0"
      aria-labelledby="packages-title"
    >
      <div className="content-wrap py-12 md:pt-20 md:pb-8">
        <EyebrowLabel text="Packages" className="mb-3" delay={0} />
        <SectionHeading id="packages-title" className="mt-0">
          <SectionLine>Pick your starting point.</SectionLine>
        </SectionHeading>
        <p className="mt-4 max-w-lg text-sm text-text-secondary">
          Fixed price ranges — scope confirmed in 24 hours. Escrow and middleman accepted on every
          order.
        </p>
      </div>

      <div
        ref={stackRef}
        className={
          isMobile
            ? "content-wrap flex flex-col gap-6 pb-16"
            : "relative mx-auto h-screen max-w-[480px] px-[18px]"
        }
      >
        {PACKAGES_LIST.map((pkg, index) => (
          <PackageCard
            key={pkg.key}
            pkg={pkg}
            stacked={!isMobile}
            zIndex={PACKAGES_LIST.length - index}
          />
        ))}
      </div>
    </section>
  );
}

type PackageCardProps = {
  pkg: (typeof PACKAGES_LIST)[number];
  stacked: boolean;
  zIndex: number;
};

function PackageCard({ pkg, stacked, zIndex }: PackageCardProps): React.JSX.Element {
  const pkgConfig = PACKAGES[pkg.key];

  return (
    <article
      data-pkg-card=""
      className={`flex flex-col rounded-md border border-b1 bg-bg p-8 md:p-9 ${
        pkg.popular ? "border-accent bg-gradient-to-br from-bg to-[rgba(124,58,237,0.07)]" : ""
      } ${stacked ? "absolute inset-x-[18px] top-[12%] will-change-transform" : ""}`}
      style={stacked ? { zIndex } : undefined}
    >
      {pkg.popular ? (
        <p className="mb-3 inline-block w-fit bg-accent px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-white">
          Most Popular
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
      <PackageDiscordCta packageKey={pkg.key} popular={pkg.popular} />
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

type PackageDiscordCtaProps = {
  packageKey: PackageKey;
  popular?: boolean;
};

function PackageDiscordCta({
  packageKey,
  popular,
}: PackageDiscordCtaProps): React.JSX.Element {
  const handleClick = async (): Promise<void> => {
    const msg = PACKAGES[packageKey].discordMsg;
    try {
      await navigator.clipboard.writeText(msg);
    } catch {
      /* clipboard optional */
    }
    window.open(SITE.discord, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      type="button"
      onClick={() => {
        void handleClick();
      }}
      className={`mt-6 w-full rounded border py-3 text-center text-sm font-bold transition-colors ${
        popular
          ? "border-accent bg-accent text-white hover:bg-transparent hover:text-accent-bright"
          : "border-accent text-accent-bright hover:bg-accent hover:text-white"
      }`}
    >
      {packageKey !== "blueprint" ? "Apply on Discord →" : "Order on Discord →"}
    </button>
  );
}
