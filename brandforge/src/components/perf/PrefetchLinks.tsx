"use client";

import { useEffect } from "react";

const PREFETCH_PATHS = ["/packages/", "/portfolio/", "/contact/"] as const;

/** Prefetch likely next pages + hover prefetch for internal links. */
export function PrefetchLinks(): React.JSX.Element | null {
  useEffect(() => {
    const injected = new Set<string>();

    const inject = (href: string): void => {
      if (injected.has(href)) return;
      injected.add(href);
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = href;
      link.as = "document";
      document.head.appendChild(link);
    };

    for (const path of PREFETCH_PATHS) inject(path);

    const onOver = (e: MouseEvent): void => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor?.href) return;
      try {
        const url = new URL(anchor.href);
        if (url.origin !== window.location.origin) return;
        if (url.pathname.startsWith("/launch")) return;
        inject(url.pathname);
      } catch {
        /* ignore */
      }
    };

    document.addEventListener("mouseover", onOver, { passive: true });

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const anchor = entry.target as HTMLAnchorElement;
            if (anchor.href) {
              try {
                const url = new URL(anchor.href);
                if (url.origin === window.location.origin) inject(url.pathname);
              } catch {
                /* ignore */
              }
            }
          }
        },
        { rootMargin: "0px" },
      );
      document.querySelectorAll("a[href^='/']").forEach((a) => io.observe(a));
      return () => {
        document.removeEventListener("mouseover", onOver);
        io.disconnect();
      };
    }

    return () => document.removeEventListener("mouseover", onOver);
  }, []);

  return null;
}
