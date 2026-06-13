"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/tracking";

const REF_KEY = "bf-partner-ref";

/** Persist ?ref= from URL and fire partner_referral once per session. */
export function PartnerReferralCapture(): React.JSX.Element | null {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (!ref) return;

    sessionStorage.setItem(REF_KEY, ref);
    const fired = sessionStorage.getItem(`bf-ref-fired-${ref}`);
    if (fired) return;

    trackEvent("partner_referral", {
      partner: ref,
      page_path: window.location.pathname,
    });
    sessionStorage.setItem(`bf-ref-fired-${ref}`, "1");
  }, []);

  return null;
}

export function partnerRefFromSession(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(REF_KEY);
}
