"use client";

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { PlansFloatingButton } from "@/components/layout/PlansFloatingButton";
import { EngagerGrowthBanner } from "@/components/layout/EngagerGrowthBanner";
import { ProfileSetupBanner } from "@/components/layout/ProfileSetupBanner";
import { Sidebar } from "@/components/layout/Sidebar";
import { OnboardingRedirect } from "@/components/layout/OnboardingRedirect";
import { OnboardingProvider } from "@/components/onboarding/OnboardingFlow";

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
        {/* App Content - Sidebar Navigation Only */}
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          <ProfileSetupBanner />
          <EngagerGrowthBanner />
          <OnboardingProvider>
            <main className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto">
              {children}
            </main>
          </OnboardingProvider>
          <PlansFloatingButton />
        </div>
      </div>
    </div>
  );
}
