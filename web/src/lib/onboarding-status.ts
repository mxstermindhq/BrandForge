import type { AuthMeResponse } from "@/providers/AuthMeProvider";

/** Profile onboarding only — listing creation is optional. */
export function isOnboardingFinished(me: AuthMeResponse | null | undefined): boolean {
  if (!me?.enabled) return false;
  return !me.pendingOnboarding;
}

export function needsProfileOnboarding(me: AuthMeResponse | null | undefined): boolean {
  return Boolean(me?.enabled && me.pendingOnboarding);
}
