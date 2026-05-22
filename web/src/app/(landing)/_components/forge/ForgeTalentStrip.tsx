"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { CuratedOperator } from "@/lib/schemas/operator.schema";

type ForgeTalentStripProps = {
  operators: CuratedOperator[];
};

export function ForgeTalentStrip({ operators }: ForgeTalentStripProps) {
  if (!operators.length) return null;

  return (
    <section id="talent" className="forge-section">
      <div className="forge-container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="forge-section-head"
        >
          <p className="forge-section-eyebrow">Vetted operators</p>
          <h2 className="forge-section-title">Talent in the furnace</h2>
          <p className="forge-section-desc">Builders, designers, devs, and growth — forged for online communities.</p>
        </motion.div>

        <div className="forge-talent-grid">
          {operators.slice(0, 8).map((op, i) => (
            <motion.div
              key={op.username}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
            >
              <Link href={`/${encodeURIComponent(op.username)}`} className="forge-talent-card" data-track={`talent_${op.username}`}>
                <div className="forge-talent-top">
                  <span className="forge-talent-name">{op.name}</span>
                  {op.isVerified ? <span className="forge-talent-verified">Verified</span> : null}
                </div>
                <p className="forge-talent-role">{op.role}</p>
                <p className="forge-talent-price">From {op.startingPrice}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
