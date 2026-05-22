"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { CONTACT } from "@/content/landing-directory";
import { useAuth } from "@/providers/AuthProvider";
import { useAuthMe } from "@/providers/AuthMeProvider";
import { MagneticButton } from "./MagneticButton";

function termHref(term: "starter" | "partner", pathname: string): string {
  const base = pathname === "/" ? "/" : "/marketplace";
  return `${base}?term=${term}${base === "/" ? "#browse" : ""}`;
}

function ForgeNavbarInner() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const raw = searchParams.get("term");
  const term =
    raw === "partner" || raw === "long" || raw === "long_term" || raw === "subscriptions"
      ? "partner"
      : "starter";
  const { session } = useAuth();
  const { me } = useAuthMe();
  const user = session?.user ?? null;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const accountHref = user ? (me?.pendingOnboarding ? "/onboarding" : "/account") : "/login";
  const dashboardHref = user ? "/dashboard" : "/login?next=/dashboard";

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
          <Link
            href={termHref("starter", pathname)}
            className={`forge-nav-link ${term === "starter" ? "forge-nav-link-active" : ""}`}
          >
            Starter
          </Link>
          <Link
            href={termHref("partner", pathname)}
            className={`forge-nav-link ${term === "partner" ? "forge-nav-link-active" : ""}`}
          >
            Partner
          </Link>
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
          {user ? (
            <Link href={dashboardHref} className="forge-nav-link hidden sm:inline">
              Dashboard
            </Link>
          ) : null}
          <Link href={accountHref} className="forge-nav-link hidden sm:inline">
            {user ? "Account" : "Sign in"}
          </Link>
          <MagneticButton href="/#browse" variant="primary" dataTrack="enter_forge">
            Browse
          </MagneticButton>
        </div>
      </div>
    </motion.header>
  );
}

export function ForgeNavbar() {
  return (
    <Suspense fallback={<header className="forge-nav" />}>
      <ForgeNavbarInner />
    </Suspense>
  );
}
