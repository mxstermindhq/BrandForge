"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import type { ProfileViewModel } from "@/lib/profile-view-model";
import { ProfileHeader } from "./ProfileHeader";
import { ProofPanels } from "./ProofPanels";
import { ConversionCTA } from "@/components/conversion/ConversionCTA";

type ProfileTab = "about" | "listings" | "reviews";

type UnifiedProfileViewProps = {
  viewModel: ProfileViewModel;
};

export function UnifiedProfileView({ viewModel }: UnifiedProfileViewProps) {
  const reduced = useReducedMotion();
  const [tab, setTab] = useState<ProfileTab>("about");
  const firstService = viewModel.services[0];
  const hireHref = firstService ? `${firstService.href}?checkout=1` : "/#browse";

  return (
    <motion.article
      className="mx-auto max-w-6xl px-4 pb-20 pt-6 sm:px-6 forge-layout"
      initial={reduced ? undefined : { opacity: 0 }}
      animate={reduced ? undefined : { opacity: 1 }}
    >
      <ProfileHeader viewModel={viewModel} />

      <div className="mt-5 flex flex-wrap gap-2">
        {(["about", "listings", "reviews"] as ProfileTab[]).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={`mp-term-tab capitalize ${tab === item ? "mp-term-tab-active" : ""}`}
          >
            {item}
          </button>
        ))}
      </div>

      {tab === "about" ? <ProofPanels viewModel={viewModel} /> : null}

      {tab === "listings" ? (
        <section className="mt-6">
          {viewModel.services.length ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {viewModel.services.map((svc) => (
                <Link key={svc.id} href={svc.href} className="forge-surface-card block p-4 hover:border-[var(--forge-gold)]">
                  <p className="forge-section-eyebrow">{svc.category}</p>
                  <h3 className="mt-1 font-headline text-lg font-semibold text-[var(--forge-text)]">{svc.title}</h3>
                  {svc.tagline ? <p className="mt-1 text-sm text-[var(--forge-text-muted)]">{svc.tagline}</p> : null}
                  <p className="mt-2 text-sm font-semibold text-[var(--forge-gold)]">{svc.priceLabel}</p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--forge-text-muted)]">No published listings yet.</p>
          )}
        </section>
      ) : null}

      {tab === "reviews" ? (
        <section className="mt-6 space-y-4">
          {viewModel.reviews.length ? (
            viewModel.reviews.map((r) => (
              <article key={r.id} className="forge-surface-card p-4">
                <p className="text-sm text-[var(--forge-gold)]">★ {r.rating} · Verified purchase</p>
                <h3 className="mt-1 font-semibold text-[var(--forge-text)]">{r.headline}</h3>
                <p className="mt-2 text-sm text-[var(--forge-text-muted)]">{r.body}</p>
                <p className="mt-2 text-xs text-[var(--forge-text-muted)]">
                  — {r.reviewerName} · {new Date(r.createdAt).toLocaleDateString()}
                </p>
              </article>
            ))
          ) : (
            <p className="text-sm text-[var(--forge-text-muted)]">Reviews appear after completed orders.</p>
          )}
        </section>
      ) : null}

      <div className="mt-8 max-w-md">
        <ConversionCTA variant="profile" operatorName={viewModel.name} hireUrl={hireHref} />
      </div>
    </motion.article>
  );
}
