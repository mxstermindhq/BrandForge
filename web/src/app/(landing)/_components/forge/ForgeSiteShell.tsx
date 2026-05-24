"use client";

import type { ReactNode } from "react";
import { OnboardingGate } from "@/components/onboarding/OnboardingGate";
import { ForgeFooter } from "./ForgeFooter";
import { ForgeNavbar } from "./ForgeNavbar";

type ForgeSiteShellProps = {
  children: ReactNode;
  /** @deprecated Global summer sky replaces per-page backgrounds */
  subtleBg?: boolean;
};

export function ForgeSiteShell({ children }: ForgeSiteShellProps) {
  return (
    <div className="forge-layout forge-site-shell">
      <OnboardingGate />
      <ForgeNavbar />
      <div className="forge-site-main">{children}</div>
      <ForgeFooter />
    </div>
  );
}
