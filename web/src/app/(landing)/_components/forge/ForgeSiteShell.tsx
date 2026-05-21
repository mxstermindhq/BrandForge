"use client";

import type { ReactNode } from "react";
import { ForgeFooter } from "./ForgeFooter";
import { ForgeNavbar } from "./ForgeNavbar";
import { StellarForgeCanvas } from "./StellarForgeCanvas";

type ForgeSiteShellProps = {
  children: ReactNode;
  /** Subtle animated forge behind inner pages */
  subtleBg?: boolean;
};

export function ForgeSiteShell({ children, subtleBg }: ForgeSiteShellProps) {
  return (
    <div className="forge-layout forge-site-shell">
      {subtleBg ? (
        <div className="forge-page-bg" aria-hidden>
          <StellarForgeCanvas variant="hero" className="h-full w-full" />
          <div className="forge-page-bg-vignette" />
        </div>
      ) : null}
      <ForgeNavbar />
      <div className="forge-site-main">{children}</div>
      <ForgeFooter />
    </div>
  );
}
