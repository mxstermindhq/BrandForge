"use client";

import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { useAuthMe } from "@/hooks/useAuthMe";
import { useBootstrap } from "@/hooks/useBootstrap";

function stepCircleClass(done: boolean): string {
  return done
    ? "font-headline flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold bg-secondary/20 text-secondary ring-1 ring-secondary/30"
    : "font-headline border-outline-variant/50 text-on-surface-variant flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold";
}

/**
 * Signed-in specialist journey: activation → offer → pipeline → delivery.
 * Complements empty explore states (real listings only — no smoke placeholders).
 */
export function MemberJourneyStrip() {
  const { session } = useAuth();
  const { me } = useAuthMe();
  const { data } = useBootstrap();
  if (!session) return null;

  const profileComplete = Boolean(me && !me.pendingOnboarding);
  const publishedCount = Math.max(0, Number(data?.publishedListingsCount) || 0);
  const hasPublishedListing = publishedCount > 0;
  const projectCount = Array.isArray(data?.projects) ? data.projects.length : 0;
  const hasActiveProjects = projectCount > 0;

  return (
    <section
      className="border-outline-variant/20 bg-surface-container-low/35 mx-6 mb-14 rounded-2xl border px-5 py-6 md:mx-12"
      aria-labelledby="member-journey-heading"
    >
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <h2
          id="member-journey-heading"
          className="font-headline text-on-surface text-xs font-black uppercase tracking-[0.28em]"
        >
          Your journey
        </h2>
        <p className="text-on-surface-variant max-w-xl text-xs font-light leading-relaxed">
          Real marketplace data only — finish these steps to compound reputation and pipeline on-platform.
        </p>
      </div>
      <ol className="grid list-none gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        <li className="flex gap-3">
          <span className={stepCircleClass(profileComplete)} aria-hidden>
            {profileComplete ? "✓" : "1"}
          </span>
          <div className="min-w-0">
            <p className="text-on-surface text-sm font-bold leading-snug">Be discoverable</p>
            <p className="text-on-surface-variant mt-1 text-xs font-light leading-relaxed">Complete your profile.</p>
            <Link
              href="/settings?tab=account"
              className="text-secondary mt-2 inline-flex text-xs font-bold hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {profileComplete ? "Review profile" : "Finish setup →"}
            </Link>
          </div>
        </li>
        <li className="flex gap-3">
          <span className={stepCircleClass(hasPublishedListing)} aria-hidden>
            {hasPublishedListing ? "✓" : "2"}
          </span>
          <div className="min-w-0">
            <p className="text-on-surface text-sm font-bold leading-snug">Publish an offer</p>
            <p className="text-on-surface-variant mt-1 text-xs font-light leading-relaxed">List a packaged service here.</p>
            <Link
              href={hasPublishedListing ? "/services" : "/services/new"}
              className="text-secondary mt-2 inline-flex text-xs font-bold hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {hasPublishedListing ? "Your listings →" : "New listing →"}
            </Link>
          </div>
        </li>
        <li className="flex gap-3">
          <span
            className="font-headline border-outline-variant/50 text-on-surface-variant flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold"
            aria-hidden
          >
            3
          </span>
          <div className="min-w-0">
            <p className="text-on-surface text-sm font-bold leading-snug">Find opportunities</p>
            <p className="text-on-surface-variant mt-1 text-xs font-light leading-relaxed">
              Browse open briefs or join your niche.
            </p>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs font-bold">
              <Link
                href="/requests"
                className="text-secondary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Open requests
              </Link>
              <span className="text-on-surface-variant" aria-hidden>
                ·
              </span>
              <Link
                href="/requests/new"
                className="text-secondary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                New brief
              </Link>
            </div>
          </div>
        </li>
        <li className="flex gap-3">
          <span className={stepCircleClass(hasActiveProjects)} aria-hidden>
            {hasActiveProjects ? "✓" : "4"}
          </span>
          <div className="min-w-0">
            <p className="text-on-surface text-sm font-bold leading-snug">Deliver &amp; review</p>
            <p className="text-on-surface-variant mt-1 text-xs font-light leading-relaxed">
              Track reputation. One review shapes your next deal.
            </p>
            <Link
              href="/chat"
              className="text-secondary mt-2 inline-flex text-xs font-bold hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {hasActiveProjects ? "Open chat →" : "Chat hub →"}
            </Link>
          </div>
        </li>
      </ol>
    </section>
  );
}
