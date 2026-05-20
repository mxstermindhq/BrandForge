"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { CONTACT } from "@/content/landing-directory";
import { OPERATOR_MEDIA } from "@/content/operator-media";
import type { CuratedOperator } from "@/lib/schemas/operator.schema";
import { IslamicPattern } from "@/components/ui/IslamicPattern";

const stats = [
  { value: "4", label: "Vetted operators" },
  { value: "1", label: "Conversation to start" },
  { value: "0", label: "Open bidding" },
] as const;

type DirectoryHeroProps = {
  operators: CuratedOperator[];
};

export function DirectoryHero({ operators }: DirectoryHeroProps) {
  const reduced = useReducedMotion();
  const mosaic = operators.slice(0, 4).map((op) => {
    const media = OPERATOR_MEDIA[op.username.toLowerCase()];
    return {
      username: op.username,
      name: op.name,
      portrait: media?.portrait ?? "/images/prince/portrait.png",
      work: media?.workPieces[0]?.image ?? media?.portrait,
    };
  });

  return (
    <section
      className="directory-hero relative overflow-hidden px-4 pb-16 pt-8 sm:px-6 lg:px-8"
      style={{ background: "var(--color-bg)" }}
    >
      <IslamicPattern className="pointer-events-none absolute inset-0 opacity-[0.035]" />
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-[min(560px,70vh)] w-[min(900px,120vw)] -translate-x-1/2 rounded-full blur-[120px]"
        style={{ background: "var(--color-gold-subtle)" }}
      />
      <div className="directory-grain pointer-events-none absolute inset-0" />

      <div className="relative z-10 mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10">
        <div>
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={reduced ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em]"
            style={{
              borderColor: "var(--color-gold-border)",
              background: "var(--color-gold-subtle)",
              color: "var(--color-gold)",
            }}
          >
            <span className="relative flex h-2 w-2">
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
                style={{ background: "var(--color-gold)" }}
              />
              <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: "var(--color-gold)" }} />
            </span>
            Curated · Verified · {CONTACT.guarantor}
          </motion.div>

          <motion.h1
            initial={reduced ? false : { opacity: 0, y: 18 }}
            animate={reduced ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.06 }}
            className="landing-gold-line max-w-[14ch] font-headline text-[clamp(2.75rem,5.5vw,4.25rem)] font-semibold leading-[1.02] tracking-[-0.02em] text-[var(--color-text-primary)]"
          >
            Operators worth introducing.
          </motion.h1>

          <motion.p
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={reduced ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.14 }}
            className="mt-8 max-w-lg text-lg leading-relaxed text-[var(--color-text-secondary)]"
          >
            A private shortlist of builders — not a gig board. One message to mxstermind scopes the right person.
          </motion.p>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={reduced ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.22 }}
            className="mt-10 flex flex-wrap gap-3"
          >
            <a href={CONTACT.telegram} target="_blank" rel="noopener noreferrer" className="btn-primary min-h-12 px-7 text-sm">
              Start a conversation →
            </a>
            <a href="#talent" className="btn-secondary min-h-12 px-7 text-sm">
              Browse directory
            </a>
          </motion.div>

          <motion.ul
            initial={reduced ? false : { opacity: 0 }}
            animate={reduced ? undefined : { opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.32 }}
            className="mt-12 grid max-w-md grid-cols-3 gap-4 border-t pt-8"
            style={{ borderColor: "var(--color-border)" }}
          >
            {stats.map((s) => (
              <li key={s.label}>
                <p className="font-headline text-2xl font-semibold tabular-nums text-[var(--color-text-primary)] sm:text-3xl">
                  {s.value}
                </p>
                <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">{s.label}</p>
              </li>
            ))}
          </motion.ul>
        </div>

        <motion.div
          initial={reduced ? false : { opacity: 0, scale: 0.98 }}
          animate={reduced ? undefined : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.12 }}
          className="hero-mosaic"
          aria-hidden={mosaic.length === 0}
        >
          {mosaic.map((item, i) => (
            <Link
              key={item.username}
              href={`/${encodeURIComponent(item.username)}`}
              className={`hero-mosaic-cell hero-mosaic-cell-${i}`}
            >
              <Image
                src={i === 0 ? item.work : item.portrait}
                alt=""
                fill
                sizes="(max-width: 1024px) 50vw, 280px"
                className="object-cover transition-transform duration-700 hover:scale-105"
                priority={i < 2}
              />
              <span className="hero-mosaic-label">{item.name}</span>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
