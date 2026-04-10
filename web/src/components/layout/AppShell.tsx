"use client";

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { Menu } from "lucide-react";
import Link from "next/link";
import { PlansFloatingButton } from "@/components/layout/PlansFloatingButton";
import { EngagerGrowthBanner } from "@/components/layout/EngagerGrowthBanner";
import { ProfileSetupBanner } from "@/components/layout/ProfileSetupBanner";
import { Sidebar } from "@/components/layout/Sidebar";
import { OnboardingRedirect } from "@/components/layout/OnboardingRedirect";

const DRAWER_FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function closeDrawer(
  setDrawer: (v: boolean) => void,
  menuButtonRef: RefObject<HTMLButtonElement | null>,
) {
  setDrawer(false);
  queueMicrotask(() => menuButtonRef.current?.focus());
}

export function AppShell({ children }: { children: ReactNode }) {
  const [drawer, setDrawer] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!drawer) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [drawer]);

  useEffect(() => {
    if (!drawer) return;
    const root = drawerRef.current;
    if (!root) return;

    function focusables(node: HTMLDivElement): HTMLElement[] {
      return Array.from(node.querySelectorAll<HTMLElement>(DRAWER_FOCUSABLE)).filter(
        (el) => !el.closest("[aria-hidden='true']") && el.tabIndex >= 0,
      );
    }

    const els = focusables(root);
    els[0]?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        closeDrawer(setDrawer, menuButtonRef);
        return;
      }
      if (e.key !== "Tab") return;
      const trap = drawerRef.current;
      if (!trap) return;
      const list = focusables(trap);
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      const active = document.activeElement;
      if (e.shiftKey) {
        if (active === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [drawer]);

  return (
    <div className="bg-background text-on-surface flex h-screen min-h-0 overflow-hidden">
      <OnboardingRedirect />
      <Sidebar className="hidden md:flex" />
      <div
        ref={drawerRef}
        id="mobile-navigation-drawer"
        className={
          drawer
            ? "fixed inset-0 z-40 md:hidden"
            : "pointer-events-none fixed inset-0 z-40 hidden"
        }
        aria-hidden={!drawer}
        {...(drawer
          ? { role: "dialog", "aria-modal": true, "aria-label": "Site navigation" }
          : {})}
      >
        <button
          type="button"
          tabIndex={-1}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          aria-label="Close navigation"
          onClick={() => closeDrawer(setDrawer, menuButtonRef)}
        />
        <Sidebar
          className="absolute left-0 top-0 z-50 h-full max-w-[min(88vw,240px)] shadow-xl"
          onNavigate={() => closeDrawer(setDrawer, menuButtonRef)}
        />
      </div>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="bg-background/95 flex min-h-[56px] items-center gap-3 px-4 py-3 backdrop-blur-md md:hidden">
          <button
            ref={menuButtonRef}
            type="button"
            className="hover:bg-surface-container-low text-on-surface rounded-lg p-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            aria-label="Open navigation"
            aria-expanded={drawer}
            aria-controls="mobile-navigation-drawer"
            onClick={() => setDrawer(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <Link
            href="/"
            className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <span className="inline-flex items-center gap-1.5 font-headline text-lg font-bold tracking-tight text-on-surface">
              <span className="text-primary text-lg leading-none">★</span>
              <span>BrandForge</span>
            </span>
          </Link>
        </header>
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          <ProfileSetupBanner />
          <EngagerGrowthBanner />
          <main className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto">
            {children}
          </main>
          <PlansFloatingButton />
        </div>
      </div>
    </div>
  );
}
