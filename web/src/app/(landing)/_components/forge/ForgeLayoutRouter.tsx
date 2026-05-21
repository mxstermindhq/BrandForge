"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ForgeSiteShell } from "./ForgeSiteShell";

export function ForgeLayoutRouter({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/") return <>{children}</>;
  return <ForgeSiteShell subtleBg>{children}</ForgeSiteShell>;
}
