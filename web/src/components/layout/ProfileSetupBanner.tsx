"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useAuthMe } from "@/hooks/useAuthMe";

const DISMISS_KEY = "mx_profile_setup_banner_dismissed";

export function ProfileSetupBanner() {
  const pathname = usePathname();
  const { session } = useAuth();
  const { me } = useAuthMe();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      setDismissed(sessionStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  const needsSetup = Boolean(session && me?.pendingOnboarding);
  if (!needsSetup || dismissed || pathname === "/welcome") return null;

  return (
    <div
      className="border-secondary/25 from-secondary/10 to-primary/5 border-b bg-gradient-to-r px-4 py-2.5 md:px-6"
      role="status"
    >
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-2 gap-x-4 text-center sm:justify-between sm:text-left">
        <p className="text-on-surface max-w-3xl text-xs font-light leading-relaxed sm:text-sm">
          <span className="font-headline text-secondary text-[10px] font-black uppercase tracking-wider">Profile</span>
          <span className="text-on-surface-variant mx-1.5">·</span>
          Finish setup on{" "}
          <Link href="/welcome" className="text-secondary font-semibold underline-offset-2 hover:underline">
            the welcome page
          </Link>{" "}
          (username, professional title, optional password) or in{" "}
          <Link href="/settings?tab=account" className="text-secondary font-semibold underline-offset-2 hover:underline">
            Settings
          </Link>
          . A matching note is in your{" "}
          <span className="text-on-surface font-medium">notifications</span>
          {me?.user?.email ? (
            <>
              ; with Resend configured you may also get the same as an{" "}
              <span className="text-on-surface font-medium">email</span>
            </>
          ) : null}
          .
        </p>
        <button
          type="button"
          onClick={() => {
            try {
              sessionStorage.setItem(DISMISS_KEY, "1");
            } catch {
              /* ignore */
            }
            setDismissed(true);
          }}
          className="text-on-surface-variant hover:text-on-surface font-headline shrink-0 text-[10px] font-bold uppercase tracking-wider"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
