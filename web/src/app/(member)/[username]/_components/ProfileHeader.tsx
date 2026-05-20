"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { ProfileViewModel } from "@/lib/profile-view-model";
import { getOperatorMedia } from "@/content/operator-media";

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

type ProfileHeaderProps = {
  viewModel: ProfileViewModel;
};

export function ProfileHeader({ viewModel }: ProfileHeaderProps) {
  const reduced = useReducedMotion();
  const media = getOperatorMedia(viewModel.username);
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
      className="relative overflow-hidden rounded-3xl border"
      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
    >
      {media?.cover ? (
        <div className="relative h-44 w-full overflow-hidden md:h-56">
          <Image
            src={media.cover}
            alt={`${viewModel.name} cover`}
            fill
            sizes="(max-width: 768px) 100vw, 1100px"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.85) 100%)" }} />
        </div>
      ) : null}

      <div className="relative z-10 flex flex-wrap items-end gap-5 px-6 pb-6 pt-4 sm:gap-6">
        {media?.portrait ? (
          <div
            className="relative -mt-16 h-28 w-28 overflow-hidden rounded-2xl border bg-[var(--color-surface)] shadow-lg sm:h-32 sm:w-32"
            style={{ borderColor: "var(--color-border-hover)" }}
          >
            <Image
              src={media.portrait}
              alt={viewModel.name}
              fill
              sizes="128px"
              className="object-cover"
              priority
            />
          </div>
        ) : (
          <div
            className="-mt-16 flex h-28 w-28 items-center justify-center rounded-2xl border bg-[var(--color-surface)] text-xl font-semibold shadow-lg sm:h-32 sm:w-32"
            style={{ borderColor: "var(--color-border-hover)", color: "var(--color-text-primary)" }}
          >
            {viewModel.initials}
          </div>
        )}

        <div className="flex flex-1 flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-headline text-3xl font-semibold leading-tight text-[var(--color-text-primary)]">
              {viewModel.name}
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {viewModel.role} · {viewModel.yearsExp > 0 ? `${viewModel.yearsExp} years` : "Experience verified"}
            </p>
            {media?.accentTagline ? (
              <p className="mt-1 text-xs italic text-[var(--color-text-muted)]">{media.accentTagline}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {viewModel.isVerified ? (
              <span
                className="rounded-full border px-2.5 py-1"
                style={{
                  borderColor: "var(--color-gold-border)",
                  background: "var(--color-gold-subtle)",
                  color: "var(--color-gold)",
                }}
              >
                Verified
              </span>
            ) : null}
            <span
              className="rounded-full border px-2.5 py-1"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
            >
              {availabilityLabel}
            </span>
            <span
              className="rounded-full border px-2.5 py-1"
              style={{
                borderColor: "var(--color-gold-border)",
                background: "var(--color-gold-subtle)",
                color: "var(--color-gold)",
              }}
            >
              Reviews {viewModel.amanahScore}/100
            </span>
            <span
              className="rounded-full border px-2.5 py-1 font-medium"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
            >
              From {viewModel.startingPrice}
            </span>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
