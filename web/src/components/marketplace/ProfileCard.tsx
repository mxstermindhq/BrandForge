"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { SellerProfile } from "@/lib/marketplace/types";

type ProfileCardProps = {
  profile: SellerProfile;
  index?: number;
};

export function ProfileCard({ profile, index = 0 }: ProfileCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
    >
      <Link href={`/profile/${profile.id}`} className="mp-profile-card">
        <div className="mp-profile-avatar" style={{ background: profile.thumbGradient }} />
        <div className="mp-profile-body">
          <h3 className="mp-profile-name">{profile.name}</h3>
          <p className="mp-profile-role">{profile.role}</p>
          <p className="mp-profile-stats">
            ★ {profile.rating} · {profile.reviewCount} reviews · {profile.responseTime} response
          </p>
          <div className="mp-profile-skills">
            {profile.skills.slice(0, 3).map((s) => (
              <span key={s} className="mp-tag">
                {s}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
