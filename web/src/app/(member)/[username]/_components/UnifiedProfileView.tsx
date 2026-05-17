"use client";

import { motion, useReducedMotion } from "framer-motion";
import { contactMessage } from "@/content/landing-directory";
import type { ProfileViewModel } from "@/lib/profile-view-model";
import { ProfileHeader } from "./ProfileHeader";
import { ProofPanels } from "./ProofPanels";
import { ProfileFaq } from "./ProfileFaq";
import { ProfileCTA } from "./ProfileCTA";

const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

type UnifiedProfileViewProps = {
  viewModel: ProfileViewModel;
};

export function UnifiedProfileView({ viewModel }: UnifiedProfileViewProps) {
  const reduced = useReducedMotion();
  const tg = contactMessage(`Profile inquiry: ${viewModel.name}`);

  return (
    <motion.article
      className="mx-auto max-w-6xl px-4 pb-20 pt-6 sm:px-6"
      variants={reduced ? undefined : pageVariants}
      initial={reduced ? undefined : "hidden"}
      animate={reduced ? undefined : "visible"}
    >
      <motion.div variants={reduced ? undefined : itemVariants}>
        <ProfileHeader viewModel={viewModel} />
      </motion.div>
      <motion.div variants={reduced ? undefined : itemVariants}>
        <ProofPanels viewModel={viewModel} />
      </motion.div>
      <motion.div variants={reduced ? undefined : itemVariants}>
        <ProfileFaq viewModel={viewModel} />
      </motion.div>
      <motion.div variants={reduced ? undefined : itemVariants}>
        <ProfileCTA telegramUrl={tg} />
      </motion.div>
    </motion.article>
  );
}
