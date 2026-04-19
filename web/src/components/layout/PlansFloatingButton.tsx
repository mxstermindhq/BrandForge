"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBootstrap } from "@/hooks/useBootstrap";

export function PlansFloatingButton() {
  const pathname = usePathname();
  const { data } = useBootstrap();

  if (
    pathname === "/plans" ||
    pathname === "/" ||
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/auth") ||
    pathname?.startsWith("/requests/new") ||
    pathname?.startsWith("/services/new") ||
    pathname?.startsWith("/payment") ||
    pathname?.startsWith("/chat")
  ) {
    return null;
  }

  const paid = data?.hasPaidPlan === true;
  if (paid) return null;

  return (
    <Link
      href="/plans?from=fab"
      title="Plans — visibility, credits, and AI headroom for active sellers"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container-high px-4 py-2.5 text-[12px] font-headline font-600 tracking-[0.04em] text-on-surface-variant shadow-lg transition-colors duration-150 hover:border-outline hover:text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <span className="material-symbols-outlined text-[16px]" aria-hidden>
        rocket_launch
      </span>
      Plans
    </Link>
  );
}
