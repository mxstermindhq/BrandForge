"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { ProfileViewModel } from "@/lib/profile-view-model";
import { filterProfileTrust } from "@/lib/trust-thresholds";

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

type ProfileHeaderProps = {
  viewModel: ProfileViewModel;
};

export function ProfileHeader({ viewModel }: ProfileHeaderProps) {
  const reduced = useReducedMotion();
  const t = filterProfileTrust(viewModel.trust);
  const availabilityLabel =
    viewModel.availability === "available-now"
      ? "Available now"
      : viewModel.availability === "available"
        ? "Available"
        : viewModel.availability === "limited"
          ? "Limited slots"
          : "Unavailable";

  const memberSince = t?.joinedAt
    ? new Date(t.joinedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : null;

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
            {memberSince ? <p className="mt-1 text-xs text-[var(--forge-text-muted)]">Member since {memberSince}</p> : null}
          </div>
          {t ? (
            <ul className="flex flex-wrap gap-2 text-xs">
              {t.isVerified ? <li className="forge-tag">Verified</li> : null}
              <li className="forge-tag">{availabilityLabel}</li>
              {t.averageRating != null ? <li className="forge-tag">★ {t.averageRating}</li> : null}
              {t.completedOrders != null ? <li className="forge-tag">{t.completedOrders} orders</li> : null}
              {t.reviewCount != null ? <li className="forge-tag">{t.reviewCount} reviews</li> : null}
              <li className="forge-tag">From {viewModel.startingPrice}</li>
            </ul>
          ) : (
            <ul className="flex flex-wrap gap-2 text-xs">
              <li className="forge-tag">{availabilityLabel}</li>
              <li className="forge-tag">From {viewModel.startingPrice}</li>
            </ul>
          )}
        </div>
      </div>
    </motion.header>
  );
}
