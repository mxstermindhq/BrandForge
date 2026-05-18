"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import { contactMessage } from "@/content/landing-directory";
import type { ProfileViewModel } from "@/lib/profile-view-model";
import { ProfileHeader } from "./ProfileHeader";
import { ProofPanels } from "./ProofPanels";
import { ProfileCTA } from "./ProfileCTA";

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
  const tg = contactMessage(`Profile inquiry: ${viewModel.name}`);
  const [tab, setTab] = useState<ProfileTab>("about");
  const reviewCards = useMemo(
    () =>
      viewModel.faq.slice(0, 3).map((item, i) => ({
        id: `${i}-${item.question}`,
        quote: item.answer,
      })),
    [viewModel.faq],
  );

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

      {tab === "work" ? (
        <motion.section
          variants={reduced ? undefined : itemVariants}
          className="mt-6 rounded-xl border p-4"
          style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
        >
          <h2 className="text-xl text-[var(--color-text-primary)]">Work</h2>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{viewModel.bestResult}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {["Done", "Doing", "Planned"].map((stage) => (
              <article key={stage} className="overflow-hidden rounded-lg border" style={{ borderColor: "var(--color-border)" }}>
                <div
                  className="h-32"
                  style={{
                    background:
                      "linear-gradient(145deg, color-mix(in srgb, var(--color-gold) 14%, white), color-mix(in srgb, var(--color-gold) 4%, white))",
                  }}
                />
                <div className="p-3">
                  <p className="text-xs uppercase tracking-[0.08em] text-[var(--color-gold)]">{stage}</p>
                  <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{viewModel.role}</p>
                </div>
              </article>
            ))}
          </div>
        </motion.section>
      ) : null}

      {tab === "reviews" ? (
        <motion.section
          variants={reduced ? undefined : itemVariants}
          className="mt-6 rounded-xl border p-4"
          style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
        >
          <h2 className="text-xl text-[var(--color-text-primary)]">Reviews</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {reviewCards.map((review, idx) => (
              <article key={review.id} className="rounded-lg border p-3" style={{ borderColor: "var(--color-border)", background: "var(--color-surface-2)" }}>
                <p className="text-xs text-[var(--color-gold)]">★★★★★</p>
                <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{review.quote}</p>
                <p className="mt-3 text-xs text-[var(--color-text-muted)]">Verified client #{idx + 1}</p>
              </article>
            ))}
          </div>
        </motion.section>
      ) : null}

      <motion.div variants={reduced ? undefined : itemVariants}>
        <ProfileCTA telegramUrl={tg} />
      </motion.div>
    </motion.article>
  );
}
