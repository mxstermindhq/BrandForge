"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useAuthMe } from "@/hooks/useAuthMe";
import { useBootstrap } from "@/hooks/useBootstrap";

const DISMISS_KEY = "mx_engager_growth_banner_dismissed";

/** Hidden where Plans FAB is hidden, plus `/` — keep the home hub calm (see docs/BLUEPRINT.md §4). */
function isPathHiddenForGrowthCta(pathname: string | null): boolean {
  if (!pathname) return true;
  if (pathname === "/") return true;
  if (pathname === "/plans") return true;
  if (pathname.startsWith("/login") || pathname.startsWith("/auth")) return true;
  if (pathname.startsWith("/requests/new") || pathname.startsWith("/services/new")) return true;
  if (pathname.startsWith("/payment")) return true;
  if (pathname === "/welcome") return true;
  return false;
}

/**
 * Soft upgrade path for the **monetizable engager** (profile-complete specialist, unpaid).
 * Does not show while `ProfileSetupBanner` is relevant — that takes priority for activation.
 */
export function EngagerGrowthBanner() {
  const pathname = usePathname();
  const { session } = useAuth();
  const { me } = useAuthMe();
  const { data } = useBootstrap();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      setDismissed(sessionStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  const profileReady = Boolean(session && !me?.pendingOnboarding);
  const unpaid = data?.hasPaidPlan !== true;
  if (!profileReady || !unpaid || dismissed || isPathHiddenForGrowthCta(pathname)) return null;

  return (
    <div
      className="border-primary/20 from-primary/10 to-surface-container-low/80 border-b bg-gradient-to-r px-4 py-2 md:px-6"
      role="region"
      aria-label="Plans and visibility"
    >
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-2 gap-x-4 text-center sm:justify-between sm:text-left">
        <p className="text-on-surface max-w-3xl text-xs font-light leading-relaxed sm:text-sm">
          <span className="font-headline text-primary text-[10px] font-black uppercase tracking-wider">Grow</span>
          <span className="text-on-surface-variant mx-1.5">·</span>
          Paid tiers reserve{" "}
          <span className="text-on-surface font-medium">listing placement</span>, season visibility when enabled, and headroom
          for <span className="text-on-surface font-medium">credits &amp; AI limits</span> as billing ships — see{" "}
          <Link href="/plans?from=growth" className="text-secondary font-semibold underline-offset-2 hover:underline">
            Plans
          </Link>
          .
        </p>
        <div className="flex shrink-0 items-center gap-3">
          <Link
            href="/plans?from=growth"
            className="bg-primary-container/80 text-on-primary-container font-headline hover:brightness-110 rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all"
          >
            View plans
          </Link>
          <button
            type="button"
            aria-label="Dismiss plans and visibility message"
            onClick={() => {
              try {
                sessionStorage.setItem(DISMISS_KEY, "1");
              } catch {
                /* ignore */
              }
              setDismissed(true);
            }}
            className="text-on-surface-variant hover:text-on-surface font-headline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary text-[10px] font-bold uppercase tracking-wider"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
