"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { SERVICES } from "@/content/home";
import { useIsMobile } from "@/hooks/use-media-query";
import { gsap, registerGsapPlugins } from "@/lib/gsap/register-plugins";
import { EASE_KINETIC } from "@/lib/motion/easing";
import { useSkipMotion } from "@/lib/motion/prefers-reduced-motion";
import { EyebrowLabel, SectionHeading, SectionLine } from "@/components/typography";

export function ServicesPinSection(): React.JSX.Element {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const skipMotion = useSkipMotion();
  const isMobile = useIsMobile();

  useGSAP(
    () => {
      registerGsapPlugins();
      const section = sectionRef.current;
      const pin = pinRef.current;
      const track = trackRef.current;
      if (!section || !pin || !track || skipMotion || isMobile) return;

      const getScrollDistance = (): number =>
        Math.max(track.scrollWidth - window.innerWidth + 64, window.innerHeight * 0.5);

      const tween = gsap.to(track, {
        x: () => -(track.scrollWidth - window.innerWidth + 32),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          pin,
          start: "top top",
          end: () => `+=${getScrollDistance()}`,
          scrub: 0.85,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });

      const cards = gsap.utils.toArray<HTMLElement>("[data-svc-card]", track);
      cards.forEach((card, index) => {
        gsap.fromTo(
          card,
          { opacity: index === 0 ? 1 : 0.72, scale: index === 0 ? 1 : 0.96 },
          {
            opacity: 1,
            scale: 1,
            scrollTrigger: {
              trigger: card,
              containerAnimation: tween,
              start: "left 75%",
              end: "left 35%",
              scrub: true,
            },
          },
        );
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { scope: sectionRef, dependencies: [skipMotion, isMobile] },
  );

  useGSAP(
    () => {
      if (skipMotion || !isMobile) return;
      const cards = gsap.utils.toArray<HTMLElement>("[data-svc-card]");
      gsap.fromTo(
        cards,
        { opacity: 0, y: 32 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: EASE_KINETIC,
          stagger: 0.12,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            once: true,
          },
        },
      );
    },
    { scope: sectionRef, dependencies: [skipMotion, isMobile] },
  );

  return (
    <section
      ref={sectionRef}
      id="services"
      className="border-y border-b1 bg-s1"
      aria-labelledby="services-title"
    >
      <div className="content-wrap py-16 md:py-20">
        <EyebrowLabel text="What We Do" className="mb-3" delay={0} />
        <SectionHeading id="services-title" className="mt-0">
          <SectionLine>
            Three disciplines. <em className="text-accent-bright not-italic">One team.</em>
          </SectionLine>
        </SectionHeading>
        <p className="mt-4 max-w-lg text-sm text-text-secondary">
          Design, development, and growth under one roof — no handoffs, no gaps, no chasing three
          vendors.
        </p>
      </div>

      {isMobile ? (
        <div className="content-wrap flex flex-col gap-4 pb-16">
          {SERVICES.map((svc) => (
            <article
              key={svc.id}
              data-svc-card=""
              className="rounded-md border border-b1 bg-bg p-8"
            >
              <ServiceCardContent svc={svc} />
            </article>
          ))}
        </div>
      ) : (
        <div ref={pinRef} className="relative h-screen overflow-hidden">
          <div
            ref={trackRef}
            className="absolute left-0 top-1/2 flex -translate-y-1/2 gap-6 pl-[max(18px,calc((100vw-var(--max))/2+18px))] pr-16 will-change-transform"
          >
            {SERVICES.map((svc) => (
              <article
                key={svc.id}
                data-svc-card=""
                className="w-[min(420px,78vw)] shrink-0 rounded-md border border-b1 bg-bg p-10 md:w-[440px]"
              >
                <ServiceCardContent svc={svc} />
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

type ServiceCardContentProps = {
  svc: (typeof SERVICES)[number];
};

function ServiceCardContent({ svc }: ServiceCardContentProps): React.JSX.Element {
  return (
    <>
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
            style={{
              background:
                "linear-gradient(90deg, transparent, transparent) padding-box",
            }}
          >
            <span className="relative before:absolute before:-left-0 before:font-mono before:text-[10px] before:text-accent-bright before:content-['→']">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}
