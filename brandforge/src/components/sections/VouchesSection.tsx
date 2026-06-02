"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { VOUCHES } from "@/content/home";
import { gsap, registerGsapPlugins } from "@/lib/gsap/register-plugins";
import { EASE_KINETIC } from "@/lib/motion/easing";
import { useSkipMotion, useMotionInView } from "@/lib/motion/prefers-reduced-motion";
import { TiltCard } from "@/components/motion/TiltCard";
import { EyebrowLabel, SectionHeading, SectionLine } from "@/components/typography";

function stars(count: number): string {
  return "★".repeat(count) + (count < 5 ? "☆" : "");
}

export function VouchesSection(): React.JSX.Element {
  const sectionRef = useRef<HTMLElement>(null);
  const skipMotion = useSkipMotion();
  const motionReady = useMotionInView(sectionRef);

  useGSAP(
    () => {
      registerGsapPlugins();
      const section = sectionRef.current;
      if (!section || skipMotion || !motionReady) return;

      const cards = gsap.utils.toArray<HTMLElement>("[data-vouch-card]", section);

      gsap.fromTo(
        cards,
        { opacity: 0, y: 56, rotateX: 8 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.85,
          ease: EASE_KINETIC,
          stagger: 0.1,
          scrollTrigger: {
            trigger: section,
            start: "top 78%",
            once: true,
          },
        },
      );

      return () => {
        gsap.killTweensOf(cards);
      };
    },
    { scope: sectionRef, dependencies: [skipMotion, motionReady] },
  );

  return (
    <section ref={sectionRef} id="vouches" className="py-[100px]" aria-labelledby="vouches-title">
      <div className="content-wrap">
        <EyebrowLabel text="Vouches" className="mb-3" delay={0} />
        <SectionHeading id="vouches-title" className="mt-0">
          <SectionLine>
            Real clients. <em className="text-accent-bright not-italic">Real words.</em>
          </SectionLine>
        </SectionHeading>
        <p className="mt-4 mb-12 max-w-lg text-sm text-text-secondary">
          Unedited vouches from real clients on Discord.
        </p>

        <div className="grid gap-3.5 md:grid-cols-2 lg:grid-cols-3">
          {VOUCHES.map((vouch) => (
            <TiltCard
              key={vouch.id}
              data-vouch-card=""
              className="relative overflow-hidden rounded-md border border-b1 bg-s1 p-6 before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-gradient-to-b before:from-accent before:to-transparent"
            >
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted">{vouch.from}</p>
              <p className="mt-2 text-xs text-[var(--amber)]" aria-label={`${vouch.stars} out of 5 stars`}>
                {stars(vouch.stars)}
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
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}
