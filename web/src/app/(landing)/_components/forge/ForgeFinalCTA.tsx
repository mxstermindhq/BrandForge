"use client";

import { motion } from "framer-motion";
import { CONTACT } from "@/content/landing-directory";
import { MagneticButton } from "./MagneticButton";
import { StellarForgeCanvas } from "./StellarForgeCanvas";

export function ForgeFinalCTA() {
  return (
    <section className="forge-final">
      <div className="forge-final-bg">
        <StellarForgeCanvas variant="collapse" className="absolute inset-0 h-full w-full opacity-90" />
        <div className="forge-final-vignette" aria-hidden />
      </div>
      <div className="forge-container forge-final-content">
        <motion.h2
          className="forge-final-title"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          READY TO BUILD?
        </motion.h2>
        <motion.div
          className="forge-final-ctas"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.6 }}
        >
          <MagneticButton href={CONTACT.discord} variant="primary" external dataTrack="final_discord">
            Join Discord
          </MagneticButton>
          <MagneticButton href="#browse" variant="secondary" dataTrack="final_marketplace">
            Explore Marketplace
          </MagneticButton>
        </motion.div>
      </div>
    </section>
  );
}
