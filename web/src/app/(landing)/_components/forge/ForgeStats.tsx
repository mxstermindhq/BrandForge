"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type Stats = {
  servicesCount: number;
  dealsClosed: number;
  registeredMembers: number;
  volumeUsdEstimate: number;
};

export function ForgeStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    void fetch("/api/marketplace/stats")
      .then((r) => r.json())
      .then((j: Stats) => setStats(j))
      .catch(() => setStats(null));
  }, []);

  const rows = [
    stats?.servicesCount != null && stats.servicesCount > 0
      ? { value: String(stats.servicesCount), label: "live listings" }
      : null,
    stats?.dealsClosed != null && stats.dealsClosed > 0
      ? { value: String(stats.dealsClosed), label: "orders completed" }
      : null,
    stats?.volumeUsdEstimate != null && stats.volumeUsdEstimate > 0
      ? { value: `$${Math.round(stats.volumeUsdEstimate).toLocaleString()}`, label: "volume" }
      : null,
    stats?.registeredMembers != null && stats.registeredMembers > 0
      ? { value: String(stats.registeredMembers), label: "members" }
      : null,
  ].filter(Boolean) as Array<{ value: string; label: string }>;

  if (!rows.length) return null;

  return (
    <section className="forge-section">
      <div className="forge-container">
        <div className="forge-stats-grid">
          {rows.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="forge-stat-cell"
            >
              <p className="forge-stat-value">{s.value}</p>
              <p className="forge-stat-label">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
