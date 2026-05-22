"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ProfileViewModel } from "@/lib/profile-view-model";
import { filterProfileTrust } from "@/lib/trust-thresholds";

type ProofPanelsProps = {
  viewModel: ProfileViewModel;
};

export function ProofPanels({ viewModel }: ProofPanelsProps) {
  const reduced = useReducedMotion();
  const t = filterProfileTrust(viewModel.trust);
  const stats: Array<[string, string]> = [];

  if (t?.completedOrders != null) stats.push(["Completed orders", String(t.completedOrders)]);
  if (t?.totalRevenueUsd != null) stats.push(["Total revenue", `$${t.totalRevenueUsd.toLocaleString()}`]);
  if (t?.reviewCount != null) stats.push(["Reviews", String(t.reviewCount)]);
  if (t?.averageRating != null) stats.push(["Average rating", `★ ${t.averageRating}`]);
  if (t?.repeatBuyers != null) stats.push(["Repeat buyers", String(t.repeatBuyers)]);
  if (t?.avgDeliveryHours != null) stats.push(["Avg delivery", `~${t.avgDeliveryHours}h`]);
  if (t?.activeListings != null) stats.push(["Active listings", String(t.activeListings)]);

  return (
    <motion.section
      initial={reduced ? undefined : { opacity: 0, y: 12 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]"
    >
      <div className="rounded-xl border border-[var(--forge-border)] bg-[var(--forge-surface)] p-4">
        <h2 className="text-xl text-[var(--forge-text)]">About</h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--forge-text-muted)]">
          {viewModel.bio || "No bio yet."}
        </p>
        {viewModel.skills.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {viewModel.skills.map((skill) => (
              <span key={skill} className="forge-tag">
                {skill}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {stats.length > 0 ? (
        <aside className="overflow-hidden rounded-xl border border-[var(--forge-border)] bg-[var(--forge-surface)]">
          <h3 className="border-b border-[var(--forge-border)] px-3 py-2 text-sm font-semibold text-[var(--forge-text)]">
            Track record
          </h3>
          {stats.map(([key, value]) => (
            <div
              key={key}
              className="grid grid-cols-[140px_1fr] gap-3 border-b border-[var(--forge-border)] px-3 py-2 text-xs last:border-0"
            >
              <span className="text-[var(--forge-text-muted)]">{key}</span>
              <span className="font-medium text-[var(--forge-text)]">{value}</span>
            </div>
          ))}
        </aside>
      ) : null}
    </motion.section>
  );
}
