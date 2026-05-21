"use client";

import { motion } from "framer-motion";

const steps = [
  { num: "01", title: "Pick", desc: "Choose a product, service, or operator from the forge." },
  { num: "02", title: "Message", desc: "Talk direct — scope, timeline, price. No bidding circus." },
  { num: "03", title: "Receive", desc: "Fast delivery built for communities and online brands." },
];

export function ForgeHowItWorks() {
  return (
    <section id="how" className="forge-section">
      <div className="forge-container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="forge-section-head forge-section-head-center"
        >
          <h2 className="forge-section-title">How it works</h2>
        </motion.div>

        <div className="forge-steps">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              className="forge-step"
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.6 }}
            >
              <span className="forge-step-num">{step.num}</span>
              <h3 className="forge-step-title">{step.title}</h3>
              <p className="forge-step-desc">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
