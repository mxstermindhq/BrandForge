"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackCtaClick, trackPageView } from "@/lib/analytics.client";

export function DirectoryAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    trackPageView();
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-track]");
      if (!target) return;
      const label = target.getAttribute("data-track") || "cta";
      const href =
        target instanceof HTMLAnchorElement
          ? target.href
          : target.querySelector("a")?.getAttribute("href") ?? "";
      trackCtaClick(label, href);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
