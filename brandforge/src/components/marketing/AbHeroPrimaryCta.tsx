"use client";

import Link from "next/link";
import { useABTest, trackAbConversion } from "@/lib/ab-test";
import { CopyInviteButton } from "@/components/marketing/CopyInviteButton";
import { ctaTrackAttrs, discordHref } from "@/lib/tracking";

const TEST_ID = "home-hero-primary-cta-2026-06";

const VARIANTS = {
  a: { label: "Start Your Rebrand", href: "/#packages" },
  b: { label: "Get Discord-Ready Branding", href: discordHref("home-hero-ab-b") },
} as const;

/** Hero primary CTA — Sprint 4 A/B test (variants A/B). */
export function AbHeroPrimaryCta(): React.JSX.Element {
  const variant = useABTest<"a" | "b">(TEST_ID, ["a", "b"]);
  const config = VARIANTS[variant];

  const onConversion = (): void => {
    trackAbConversion(TEST_ID, variant);
  };

  if (variant === "a") {
    return (
      <div className="mt-10 flex flex-wrap items-center gap-3">
        <Link
          href={config.href}
          onClick={onConversion}
          className="rounded bg-accent px-7 py-3.5 text-sm font-bold text-white hover:bg-accent-bright"
        >
          {config.label}
        </Link>
        <a
          href={discordHref("home-hero")}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onConversion}
          className="rounded border border-b2 px-6 py-3 text-sm font-semibold text-text-secondary hover:border-[var(--a-mid)] hover:text-text"
          {...ctaTrackAttrs("discord", "home-hero")}
        >
          Get a quote on Discord
        </a>
        <CopyInviteButton campaign="home-hero-copy" />
      </div>
    );
  }

  return (
    <div className="mt-10 flex flex-wrap items-center gap-3">
      <a
        href={config.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onConversion}
        className="rounded bg-accent px-7 py-3.5 text-sm font-bold text-white hover:bg-accent-bright"
        {...ctaTrackAttrs("discord", "home-hero-ab-b")}
      >
        {config.label}
      </a>
      <Link
        href="/#packages"
        onClick={onConversion}
        className="rounded border border-b2 px-6 py-3 text-sm font-semibold text-text-secondary hover:border-[var(--a-mid)] hover:text-text"
      >
        View packages ↓
      </Link>
      <CopyInviteButton campaign="home-hero-copy" />
    </div>
  );
}
