"use client";

import { motion } from "framer-motion";
import { FORGE_ORBIT_CARDS, FORGE_TRUST } from "@/content/forge-marketplace";
import { ConversionCTA } from "@/components/conversion/ConversionCTA";
import { useForgeParallax } from "./useForgeParallax";

const orbitPositions = [
  { x: "-38%", y: "-18%", rotate: -8, delay: 0 },
  { x: "42%", y: "-22%", rotate: 6, delay: 0.15 },
  { x: "-42%", y: "28%", rotate: 5, delay: 0.3 },
  { x: "40%", y: "32%", rotate: -6, delay: 0.45 },
  { x: "-8%", y: "-32%", rotate: 3, delay: 0.2 },
  { x: "12%", y: "38%", rotate: -4, delay: 0.35 },
];

export function ForgeHero() {
  const parallax = useForgeParallax(12);

  return (
    <section id="hero" className="forge-hero">
      <div
        className="forge-hero-orbit-layer"
        style={{
          transform: `translate(${parallax.x * 8}px, ${parallax.y * 8}px)`,
        }}
        aria-hidden
      >
        {FORGE_ORBIT_CARDS.map((card, i) => {
          const pos = orbitPositions[i % orbitPositions.length];
          return (
            <motion.div
              key={card.title}
              className="forge-orbit-card"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: [0, -10, 0],
                rotateY: [pos.rotate, pos.rotate + 4, pos.rotate],
              }}
              transition={{
                opacity: { delay: 0.4 + pos.delay, duration: 0.6 },
                scale: { delay: 0.4 + pos.delay, duration: 0.6 },
                y: { duration: 5 + i * 0.4, repeat: Infinity, ease: "easeInOut", delay: pos.delay },
                rotateY: { duration: 6 + i * 0.3, repeat: Infinity, ease: "easeInOut" },
              }}
              style={{
                left: `calc(50% + ${pos.x})`,
                top: `calc(50% + ${pos.y})`,
              }}
            >
              <span className="forge-orbit-icon">{card.icon}</span>
              <span className="forge-orbit-title">{card.title}</span>
              <span className="forge-orbit-price">{card.price}</span>
            </motion.div>
          );
        })}
      </div>

      <div
        className="forge-hero-content"
        style={{
          transform: `translate(${parallax.x * -6}px, ${parallax.y * -4}px)`,
        }}
      >
        <motion.p
          className="forge-eyebrow"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.7 }}
        >
          DIGITAL PRODUCTS • SERVICES • TALENT • AI
        </motion.p>

        <motion.h1
          className="forge-headline"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="forge-headline-line">FORGE</span>
          <span className="forge-headline-line forge-headline-molten">ANYTHING</span>
          <span className="forge-headline-line">DIGITAL</span>
        </motion.h1>

        <motion.p
          className="forge-subhead"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7 }}
        >
          Buy services, products, systems and execution — instantly.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.7 }}
        >
          <ConversionCTA variant="hero" />
        </motion.div>

        <motion.ul
          className="forge-trust-list mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          {FORGE_TRUST.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
