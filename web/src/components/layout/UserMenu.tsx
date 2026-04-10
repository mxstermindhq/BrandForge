"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { safeImageSrc } from "@/lib/image-url";
import { OnlinePresenceDot } from "@/components/ui/OnlinePresenceDot";

export function UserMenu({
  name,
  email,
  avatarUrl,
  showOnlinePulse,
}: {
  name: string;
  email?: string | null;
  avatarUrl?: string | null;
  /** When true, shows a welcoming “you’re active” pulse beside the avatar. */
  showOnlinePulse?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { signOut } = useAuth();
  const safeAvatar = safeImageSrc(avatarUrl);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1 transition-colors duration-150 hover:bg-surface-container-high focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        title={email ?? undefined}
      >
        <div className="relative flex h-7 w-7 shrink-0">
          <div className="flex h-7 w-7 shrink-0 overflow-hidden rounded-full ring-1 ring-outline-variant">
            {safeAvatar ? (
              <Image
                src={safeAvatar}
                alt=""
                width={28}
                height={28}
                className="h-full w-full object-cover"
                unoptimized
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-surface-container-high text-[10px] font-600 text-on-surface">
                {name.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          {showOnlinePulse ? (
            <OnlinePresenceDot active className="absolute -bottom-0.5 -right-0.5 ring-2 ring-surface-container" />
          ) : null}
        </div>
        <div className="min-w-0 flex-1 text-left">
          <p className="truncate text-[12px] font-body font-500 text-on-surface">{name}</p>
          {email ? (
            <p className="truncate text-[11px] font-body text-on-surface-variant">{email}</p>
          ) : null}
        </div>
      </button>
      {open ? (
        <div className="absolute bottom-full left-0 right-0 z-50 mb-1 rounded-xl border border-outline-variant/60 bg-surface-container-highest py-1 shadow-lg">
          <Link
            href="/settings"
            className="block min-h-[44px] px-3 py-2.5 text-[13px] text-on-surface transition-colors hover:bg-surface-container-high focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            onClick={() => setOpen(false)}
          >
            Account
          </Link>
          <Link
            href="/plans"
            className="block min-h-[44px] px-3 py-2.5 text-[13px] text-on-surface transition-colors hover:bg-surface-container-high focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            onClick={() => setOpen(false)}
          >
            Billing
          </Link>
          <button
            type="button"
            className="w-full min-h-[44px] px-3 py-2.5 text-left text-[13px] text-critical transition-colors hover:bg-critical-container/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            onClick={() => {
              setOpen(false);
              void signOut();
            }}
          >
            Logout
          </button>
        </div>
      ) : null}
    </div>
  );
}
