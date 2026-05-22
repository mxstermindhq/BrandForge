import type { AuthMeResponse } from "@/providers/AuthMeProvider";

/** True when the user should leave onboarding flows (profile + listing done, or has live listings). */
export function isOnboardingFinished(me: AuthMeResponse | null | undefined): boolean {
  if (!me?.enabled) return false;
  if ((me.publishedServiceCount ?? 0) > 0 || (me.ownedServiceCount ?? 0) > 0) return true;
  if (!me.pendingOnboarding && !me.pendingSellerSetup) return true;
  return false;
}
