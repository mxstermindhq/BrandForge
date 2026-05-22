"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { ProfileViewModel } from "@/lib/profile-view-model";

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

type ProfileHeaderProps = {
  viewModel: ProfileViewModel;
};

export function ProfileHeader({ viewModel }: ProfileHeaderProps) {
  const reduced = useReducedMotion();
  const t = viewModel.trust;
  const availabilityLabel =
    viewModel.availability === "available-now"
      ? "Available now"
      : viewModel.availability === "available"
        ? "Available"
        : viewModel.availability === "limited"
          ? "Limited slots"
          : "Unavailable";

  return (
    <motion.header
      variants={reduced ? undefined : itemVariants}
      initial={reduced ? undefined : "hidden"}
      animate={reduced ? undefined : "visible"}
      className="relative overflow-hidden rounded-3xl border border-[var(--forge-border)] bg-[var(--forge-surface)]"
    >
      <div className="relative z-10 flex flex-wrap items-end gap-5 px-6 py-6 sm:gap-6">
        {viewModel.avatarUrl ? (
          <div className="relative h-28 w-28 overflow-hidden rounded-2xl border border-[var(--forge-border)] sm:h-32 sm:w-32">
            <Image src={viewModel.avatarUrl} alt={viewModel.name} fill sizes="128px" className="object-cover" />
          </div>
        ) : (
          <div className="flex h-28 w-28 items-center justify-center rounded-2xl border border-[var(--forge-border)] bg-[var(--forge-surface-2)] text-xl font-semibold text-[var(--forge-text)] sm:h-32 sm:w-32">
            {viewModel.initials}
          </div>
        )}

        <div className="flex flex-1 flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-headline text-3xl font-semibold leading-tight text-[var(--forge-text)]">{viewModel.name}</h1>
            <p className="text-sm text-[var(--forge-text-muted)]">@{viewModel.username} · {viewModel.role}</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {viewModel.isVerified ? (
              <span className="forge-tag">Verified</span>
            ) : null}
            <span className="forge-tag">{availabilityLabel}</span>
            {t?.averageRating != null ? <span className="forge-tag">★ {t.averageRating}</span> : null}
            {t?.completedOrders != null ? <span className="forge-tag">{t.completedOrders} orders</span> : null}
            <span className="forge-tag">From {viewModel.startingPrice}</span>
            {viewModel.profileCompletionPercent != null ? (
              <span className="forge-tag">{viewModel.profileCompletionPercent}% complete</span>
            ) : null}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
