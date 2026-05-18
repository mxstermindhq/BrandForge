"use client";

import { Ban, Trophy } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { ProfileViewModel } from "@/lib/profile-view-model";

type ProofPanelsProps = {
  viewModel: ProfileViewModel;
};

const rowClass = "grid grid-cols-[140px_1fr] items-center gap-3 border-b px-3 py-2 text-xs transition-colors duration-[var(--duration-fast)] hover:bg-[var(--color-surface-2)]";

export function ProofPanels({ viewModel }: ProofPanelsProps) {
  const reduced = useReducedMotion();
  const stats = [
    ["Amanah score", `${viewModel.amanahScore}/100`],
    ["Completion rate", `${viewModel.completionRate}%`],
    ["Starting price", viewModel.startingPrice],
    ["Typical timeline", viewModel.typicalTimeline],
    ["Work style", viewModel.workStyle],
    ["Ideal client", viewModel.idealClient],
  ];

  return (
    <motion.section
      initial={reduced ? undefined : { opacity: 0, y: 12 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={reduced ? { duration: 0 } : { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]"
    >
      <div className="space-y-4">
        <div className="rounded-xl border p-4" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
          <h2 className="text-xl text-[var(--color-text-primary)]">About</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">{viewModel.bio}</p>
        </div>

        <div className="rounded-xl border-l-2 p-4" style={{ borderLeftColor: "var(--color-gold)", background: "var(--color-gold-subtle)" }}>
          <p className="flex items-center gap-1.5 text-xs uppercase tracking-[0.08em] text-[var(--color-gold)]">
            <Trophy size={12} aria-hidden="true" />
            Best result
          </p>
          <p className="mt-1 text-sm text-[var(--color-text-primary)]">{viewModel.bestResult}</p>
        </div>

        <div className="rounded-xl border-l-2 p-4" style={{ borderLeftColor: "var(--color-border-hover)", background: "var(--color-surface-2)" }}>
          <p className="flex items-center gap-1.5 text-xs uppercase tracking-[0.08em]" style={{ color: "var(--color-text-secondary)" }}>
            <Ban size={12} aria-hidden="true" />
            Won't take on
          </p>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{viewModel.wontTakeOn}</p>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="overflow-hidden rounded-xl border" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
          <h3 className="border-b px-3 py-2 text-sm font-semibold text-[var(--color-text-primary)]" style={{ borderColor: "var(--color-border)" }}>
            Operator stats
          </h3>
          {stats.map(([key, value]) => (
            <div key={key} className={rowClass} style={{ borderColor: "var(--color-border)" }}>
              <span className="text-[var(--color-text-secondary)]">{key}</span>
              <span className="font-medium text-[var(--color-text-primary)]">{value}</span>
            </div>
          ))}
        </div>

        <div className="rounded-xl border p-4" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Skills</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {viewModel.skills.map((skill) => (
              <span key={skill} className="rounded-full border px-2 py-0.5 text-[10px]" style={{ borderColor: "var(--color-border)", background: "var(--color-surface-3)", color: "var(--color-text-secondary)" }}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      </aside>
    </motion.section>
  );
}
