"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { FORGE_STATS } from "@/content/forge-marketplace";

function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <motion.div
      className="forge-stat"
      initial={{ opacity: 0, scale: 0.92 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <p className="forge-stat-value">{value}</p>
      <p className="forge-stat-label">{label}</p>
    </motion.div>
  );
}

export function ForgeStats() {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} id="stats" className="forge-section forge-stats-section">
      <div className="forge-container">
        <div className="forge-stats-grid">
          {FORGE_STATS.map((s) => (
            <StatBlock key={s.label} value={s.value} label={s.label} />
          ))}
        </div>
      </div>
      {inView ? <div className="forge-stats-glow" aria-hidden /> : null}
    </section>
  );
}
