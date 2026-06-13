"use client";

import { useCallback, useState } from "react";
import type { PackageKey } from "@/config/site";
import { PACKAGES } from "@/config/site";
import { CopyIntakeButton } from "@/components/marketing/CopyIntakeButton";
import { ctaTrackAttrs, discordHref, trackEvent } from "@/lib/tracking";

type StartPackageButtonProps = {
  packageKey: PackageKey;
  label?: string;
  className?: string;
  variant?: "primary" | "secondary";
};

function tierIntakeMessage(key: PackageKey): string {
  const cfg = PACKAGES[key];
  return `Hi BrandForge, I'm interested in the ${cfg.label} package. My project: `;
}

/** Start tier — copies intake message, opens Discord, modal fallback if copy fails. */
export function StartPackageButton({
  packageKey,
  label,
  className = "",
  variant = "primary",
}: StartPackageButtonProps): React.JSX.Element {
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState(false);
  const cfg = PACKAGES[packageKey];
  const campaign = `package-tier-${packageKey}`;
  const message = tierIntakeMessage(packageKey);
  const buttonLabel = label ?? `Start ${cfg.label.replace(/^The\s+/, "")}`;

  const copyMessage = useCallback(async (): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(message);
      return true;
    } catch {
      return false;
    }
  }, [message]);

  const onPrimaryClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>): void => {
      trackEvent("click_package_tier", { tier: packageKey, label: cfg.label });
      void copyMessage().then((ok) => {
        if (ok) {
          setToast(true);
          window.setTimeout(() => setToast(false), 2500);
        } else {
          e.preventDefault();
          setModalOpen(true);
        }
      });
    },
    [packageKey, cfg.label, copyMessage],
  );

  const primaryClasses =
    variant === "primary"
      ? "border-accent bg-accent text-white hover:bg-transparent hover:text-accent-bright"
      : "border-accent text-accent-bright hover:bg-accent hover:text-white";

  return (
    <>
      <div className={`relative flex flex-col gap-2 sm:flex-row ${className}`}>
        <a
          href={discordHref(campaign)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onPrimaryClick}
          className={`block w-full rounded border py-3 text-center text-sm font-bold transition-colors sm:flex-1 ${primaryClasses}`}
          {...ctaTrackAttrs("package", campaign)}
        >
          {buttonLabel} →
        </a>
        <button
          type="button"
          onClick={() => {
            trackEvent("click_package_tier", { tier: packageKey, label: cfg.label });
            setModalOpen(true);
          }}
          className="w-full rounded border border-b2 py-2 font-mono text-[10px] text-muted hover:border-accent sm:hidden"
        >
          Copy intake message
        </button>
        {toast ? (
          <span
            role="status"
            className="pointer-events-none absolute -bottom-9 left-0 z-10 whitespace-nowrap rounded border border-b1 bg-bg px-2 py-1 font-mono text-[9px] text-green shadow-lg"
          >
            Message copied — paste in Discord
          </span>
        ) : null}
      </div>

      {modalOpen ? (
        <div
          className="fixed inset-0 z-[400] flex items-end justify-center bg-bg/80 p-4 sm:items-center"
          role="dialog"
          aria-modal
          aria-labelledby="pkg-intake-title"
        >
          <div className="w-full max-w-md rounded-md border border-b1 bg-s1 p-6">
            <h3 id="pkg-intake-title" className="text-lg font-bold">
              {cfg.label} intake
            </h3>
            <p className="mt-2 text-sm text-text-secondary">
              Copy this message, then open Discord and paste in a DM or ticket channel.
            </p>
            <pre className="mt-4 max-h-40 overflow-auto rounded border border-b1 bg-bg p-3 text-xs whitespace-pre-wrap">
              {message}
            </pre>
            <div className="mt-4 flex flex-wrap gap-2">
              <CopyIntakeButton text={message} label="Copy message" />
              <a
                href={discordHref(campaign)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded bg-discord px-4 py-2 font-mono text-[10px] font-bold text-white"
                {...ctaTrackAttrs("discord", campaign)}
              >
                Open Discord
              </a>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded border border-b2 px-4 py-2 font-mono text-[10px] text-muted"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
