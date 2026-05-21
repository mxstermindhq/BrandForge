"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import type { ProfileViewModel } from "@/lib/profile-view-model";
import { getOperatorMedia } from "@/content/operator-media";
import { ProfileHeader } from "./ProfileHeader";
import { ProofPanels } from "./ProofPanels";
import { ProfileStickyCTA } from "@/components/directory/ProfileStickyCTA";

const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

type UnifiedProfileViewProps = {
  viewModel: ProfileViewModel;
};

type ProfileTab = "about" | "work" | "reviews";

export function UnifiedProfileView({ viewModel }: UnifiedProfileViewProps) {
  const reduced = useReducedMotion();
  const [tab, setTab] = useState<ProfileTab>("about");
  const media = getOperatorMedia(viewModel.username);

  return (
    <motion.article
      className="mx-auto max-w-6xl px-4 pb-20 pt-6 sm:px-6"
      variants={reduced ? undefined : pageVariants}
      initial={reduced ? undefined : "hidden"}
      animate={reduced ? undefined : "visible"}
    >
      <motion.div variants={reduced ? undefined : itemVariants}>
        <ProfileHeader viewModel={viewModel} />
      </motion.div>

      <motion.div
        variants={reduced ? undefined : itemVariants}
        className="mt-5 rounded-2xl border-l-2 px-4 py-3"
        style={{ borderLeftColor: "var(--color-gold)", background: "var(--color-gold-subtle)" }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-gold)]">Best result</p>
        <p className="mt-1 text-sm text-[var(--color-text-primary)]">{viewModel.bestResult}</p>
        <p className="mt-2 text-sm font-medium text-[var(--color-text-primary)]">
          From {viewModel.startingPrice} · {viewModel.pricingModel}
        </p>
      </motion.div>

      <motion.div variants={reduced ? undefined : itemVariants} className="mt-5 flex flex-wrap gap-2">
        {(["about", "work", "reviews"] as ProfileTab[]).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className="rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] transition-colors"
            style={{
              borderColor: tab === item ? "var(--color-gold-border)" : "var(--color-border)",
              background: tab === item ? "var(--color-gold-subtle)" : "var(--color-surface)",
              color: tab === item ? "var(--color-gold)" : "var(--color-text-secondary)",
            }}
          >
            {item}
          </button>
        ))}
      </motion.div>

      {tab === "about" ? (
        <motion.div variants={reduced ? undefined : itemVariants}>
          <ProofPanels viewModel={viewModel} />
        </motion.div>
      ) : null}

      {tab === "work" && viewModel.services.length > 0 ? (
        <motion.section variants={reduced ? undefined : itemVariants} className="mt-6">
          <h2 className="font-headline text-xl font-semibold text-[var(--color-text-primary)]">Listings</h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Short-term deals and subscriptions — message on Discord to order.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {viewModel.services.map((svc) => (
              <Link
                key={svc.id}
                href={svc.href}
                className="group block rounded-2xl border p-4 transition-all hover:-translate-y-0.5 hover:border-[var(--color-gold-border)]"
                style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--color-gold)]">
                  {svc.listingType === "long_term" ? "Long term" : "Short term"} · {svc.category}
                </p>
                <h3 className="mt-2 font-headline text-lg font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-gold)]">
                  {svc.title}
                </h3>
                {svc.tagline ? (
                  <p className="mt-1 line-clamp-2 text-sm text-[var(--color-text-secondary)]">{svc.tagline}</p>
                ) : null}
                <p className="mt-3 text-sm font-semibold text-[var(--color-gold)]">{svc.priceLabel}</p>
              </Link>
            ))}
          </div>
        </motion.section>
      ) : null}

      {tab === "work" && media?.workPieces?.length ? (
        <motion.section
          variants={reduced ? undefined : itemVariants}
          className="mt-6 grid gap-5 md:grid-cols-2"
        >
          {media.workPieces.map((piece) => (
            <Link
              key={piece.id}
              href={`/work/${encodeURIComponent(viewModel.username)}/${encodeURIComponent(piece.id)}`}
              className="group block overflow-hidden rounded-2xl border bg-[var(--color-surface)] transition-all hover:-translate-y-0.5 hover:border-[var(--color-border-hover)]"
              style={{ borderColor: "var(--color-border)" }}
            >
              <div className="relative h-60 w-full overflow-hidden">
                <Image
                  src={piece.image}
                  alt={piece.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 600px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span
                  className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] backdrop-blur"
                  style={{
                    background: "color-mix(in srgb, white 82%, transparent)",
                    color: "var(--color-gold)",
                  }}
                >
                  {piece.stage}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-headline text-lg font-semibold text-[var(--color-text-primary)]">
                  {piece.title}
                </h3>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{piece.description}</p>
              </div>
            </Link>
          ))}
        </motion.section>
      ) : null}

      {tab === "work" && !viewModel.services.length && !media?.workPieces?.length ? (
        <motion.section
          variants={reduced ? undefined : itemVariants}
          className="mt-6 rounded-2xl border p-6 text-sm text-[var(--color-text-secondary)]"
          style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
        >
          Listings and portfolio coming soon.
        </motion.section>
      ) : null}

      {tab === "reviews" ? (
        <motion.section
          variants={reduced ? undefined : itemVariants}
          className="mt-6"
        >
          {media?.reviews?.length ? (
            <>
              <div
                className="rounded-2xl border p-5"
                style={{
                  borderColor: "var(--color-gold-border)",
                  background: "var(--color-gold-subtle)",
                }}
              >
                <p className="text-xs uppercase tracking-[0.08em] text-[var(--color-gold)]">Hero quote</p>
                <p className="mt-2 text-lg italic leading-relaxed text-[var(--color-text-primary)]">
                  “{media.reviews[0].quote}”
                </p>
                <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
                  — {media.reviews[0].reviewer} · {media.reviews[0].context}
                </p>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {media.reviews.slice(1).map((review) => (
                  <article
                    key={review.id}
                    className="rounded-2xl border p-4"
                    style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
                  >
                    <p className="text-xs text-[var(--color-gold)]">★★★★★</p>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                      “{review.quote}”
                    </p>
                    <p className="mt-3 text-xs text-[var(--color-text-muted)]">
                      — {review.reviewer} · {review.context}
                    </p>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <div
              className="rounded-2xl border p-6 text-sm text-[var(--color-text-secondary)]"
              style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
            >
              Reviews will appear here as projects close.
            </div>
          )}
        </motion.section>
      ) : null}

      <motion.div variants={reduced ? undefined : itemVariants}>
        <ProfileStickyCTA operatorName={viewModel.name} context={`Profile inquiry: ${viewModel.name} (@${viewModel.username})`} />
      </motion.div>
    </motion.article>
  );
}
