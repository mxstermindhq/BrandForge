"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { PORTFOLIO } from "@/content/home";
import { gsap, registerGsapPlugins } from "@/lib/gsap/register-plugins";
import { EASE_KINETIC } from "@/lib/motion/easing";
import { useSkipMotion } from "@/lib/motion/prefers-reduced-motion";
import { SectionHeading, SectionLine } from "@/components/typography";

export function PortfolioSection(): React.JSX.Element {
  const sectionRef = useRef<HTMLElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const midRef = useRef<HTMLDivElement>(null);
  const skipMotion = useSkipMotion();

  useGSAP(
    () => {
      registerGsapPlugins();
      const section = sectionRef.current;
      if (!section || skipMotion) return;

      if (backRef.current) {
        gsap.to(backRef.current, {
          yPercent: 18,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      if (midRef.current) {
        gsap.to(midRef.current, {
          yPercent: 36,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      const cards = gsap.utils.toArray<HTMLElement>("[data-port-card]", section);
      cards.forEach((card, index) => {
        gsap.fromTo(
          card,
          {
            clipPath: "inset(100% 0% 0% 0%)",
            y: 48,
            opacity: 0,
          },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            y: 0,
            opacity: 1,
            duration: 0.95,
            ease: EASE_KINETIC,
            delay: index * 0.06,
            scrollTrigger: {
              trigger: card,
              start: "top 88%",
              once: true,
            },
          },
        );

        gsap.to(card, {
          yPercent: -8 * (1 + index * 0.15),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });

      return () => {
        gsap.killTweensOf([backRef.current, midRef.current, ...cards].filter(Boolean));
      };
    },
    { scope: sectionRef, dependencies: [skipMotion] },
  );

  return (
    <section ref={sectionRef} id="portfolio" className="relative overflow-hidden py-[100px]">
      <div
        ref={backRef}
        className="pointer-events-none absolute -left-1/4 top-0 h-[120%] w-1/2 opacity-30"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(124,58,237,0.12), transparent 70%)",
        }}
      />
      <div
        ref={midRef}
        className="pointer-events-none absolute -right-1/4 top-1/4 h-full w-1/2 opacity-20"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(124,58,237,0.08), transparent 65%)",
        }}
      />

      <div className="content-wrap relative">
        <SectionHeading>
          <SectionLine>
            Work we&apos;ve <em className="text-accent-bright not-italic">shipped.</em>
          </SectionLine>
        </SectionHeading>
        <p className="mt-4 max-w-lg text-sm text-text-secondary">
          Real projects. Live URLs. Verified by clients.
        </p>

        <div className="mt-12 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-2">
          {PORTFOLIO.map((item) => (
            <article
              key={item.id}
              data-port-card=""
              className="relative overflow-hidden rounded-md border border-b1 bg-s1 p-6 will-change-transform"
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
