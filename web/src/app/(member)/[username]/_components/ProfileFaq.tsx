"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { ProfileViewModel } from "@/lib/profile-view-model";

type ProfileFaqProps = {
  viewModel: ProfileViewModel;
};

export function ProfileFaq({ viewModel }: ProfileFaqProps) {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(0);

  return (
    <motion.section
      initial={reduced ? undefined : { opacity: 0 }}
      whileInView={reduced ? undefined : { opacity: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={reduced ? { duration: 0 } : { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="mt-8 rounded-xl border p-4"
      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
    >
      <h2 className="text-xl text-[var(--color-text-primary)]">Profile FAQ</h2>
      <div className="mt-4 space-y-2">
        {(viewModel.faq ?? []).map((item, idx) => {
          const active = idx === open;
          return (
            <div
              key={item.question}
              className="rounded-lg border-l-2 border p-3"
              style={{
                borderLeftColor: active ? "var(--color-gold)" : "transparent",
                borderColor: "var(--color-border)",
                background: "var(--color-surface-2)",
              }}
            >
              <button type="button" className="flex w-full items-center justify-between text-left" onClick={() => setOpen(active ? -1 : idx)}>
                <span className="text-sm font-medium text-[var(--color-text-primary)]">{item.question}</span>
                <motion.span animate={{ rotate: active ? 180 : 0 }} transition={reduced ? { duration: 0 } : { duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}>
                  <ChevronDown size={16} aria-hidden="true" className="text-[var(--color-text-secondary)]" />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {active ? (
                  <motion.div
                    initial={reduced ? { opacity: 1, height: "auto" } : { opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={reduced ? { opacity: 1, height: "auto" } : { opacity: 0, height: 0 }}
                    transition={reduced ? { duration: 0 } : { duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <p className="pt-3 text-[13px] leading-[1.6] text-[var(--color-text-secondary)]">{item.answer}</p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </motion.section>
  );
}
