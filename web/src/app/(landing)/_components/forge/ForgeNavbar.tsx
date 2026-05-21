"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { CONTACT } from "@/content/landing-directory";
import { MagneticButton } from "./MagneticButton";

const links = [
  { href: "#browse", label: "Marketplace" },
  { href: "#browse", label: "Products" },
  { href: "#trending", label: "Services" },
  { href: "#talent", label: "Talent" },
] as const;

export function ForgeNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`forge-nav ${scrolled ? "forge-nav-scrolled" : ""}`}
    >
      <div className="forge-nav-inner">
        <Link href="/" className="forge-nav-brand">
          <span className="forge-nav-mark" aria-hidden>
            ◆
          </span>
          <span>
            <span className="forge-nav-title">BrandForge.gg</span>
          </span>
        </Link>

        <nav className="forge-nav-links" aria-label="Primary">
          {links.map((item) => (
            <a key={item.label} href={item.href} className="forge-nav-link">
              {item.label}
            </a>
          ))}
          <a
            href={CONTACT.discord}
            target="_blank"
            rel="noopener noreferrer"
            className="forge-nav-link"
            data-track="nav_discord"
          >
            Discord
          </a>
        </nav>

        <div className="forge-nav-actions">
          <MagneticButton href="#browse" variant="primary" dataTrack="enter_forge">
            Enter Forge
          </MagneticButton>
        </div>
      </div>
    </motion.header>
  );
}
