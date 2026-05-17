"use client";

import { motion, useReducedMotion } from "framer-motion";
import { IslamicPattern } from "@/components/ui/IslamicPattern";
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
      className="relative overflow-hidden rounded-2xl border p-6"
      style={{ borderColor: "var(--color-gold-border)", background: "var(--color-surface)" }}
    >
      <IslamicPattern className="pointer-events-none absolute inset-0" />
      <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full border text-xl font-semibold"
            style={{ borderColor: "var(--color-gold-border)", background: "var(--color-gold-subtle)", color: "var(--color-text-primary)" }}
          >
            {viewModel.initials}
          </div>
          <div>
            <h1 className="text-[28px] leading-tight text-[var(--color-text-primary)]">{viewModel.name}</h1>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {viewModel.role} · {viewModel.yearsExp > 0 ? `${viewModel.yearsExp} years` : "Experience verified"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {viewModel.isVerified ? (
            <span className="rounded-full border px-2.5 py-1" style={{ borderColor: "var(--color-emerald)", background: "var(--color-emerald-subtle)", color: "var(--color-emerald-text)" }}>
              Verified
            </span>
          ) : null}
          <span className="rounded-full border px-2.5 py-1" style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}>
            {availabilityLabel}
          </span>
          <span className="rounded-full border px-2.5 py-1" style={{ borderColor: "var(--color-gold-border)", background: "var(--color-gold-subtle)", color: "var(--color-gold)" }}>
            Amanah {viewModel.amanahScore}/100
          </span>
        </div>
      </div>
    </motion.header>
  );
}
