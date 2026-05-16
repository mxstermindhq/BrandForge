"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useAuthMe } from "@/hooks/useAuthMe";
import { safeImageSrc } from "@/lib/image-url";
import { talentInitials } from "@/lib/talent-types";
import { profilePath } from "@/lib/reserved-paths";

type LandingProfileMenuProps = {
  onEditProfile: () => void;
};

export function LandingProfileMenu({ onEditProfile }: LandingProfileMenuProps) {
  const { session, signOut, authReady } = useAuth();
  const { me } = useAuthMe();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const username = me?.profile?.username || "";
  const name = me?.profile?.full_name || username || "Account";
  const avatar = safeImageSrc(me?.profile?.avatar_url);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  if (!authReady) {
    return <div className="h-10 w-10 animate-pulse rounded-full bg-surface-container-high" />;
  }

  if (!session) {
    return (
      <Link href="/login?next=/" className="btn-primary min-h-10 px-4 text-sm">
        Sign in
      </Link>
    );
  }

  const profileHref = username ? profilePath(username) : "/settings";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-primary/40 bg-surface-container-high ring-2 ring-transparent transition hover:ring-primary/30"
        aria-label="Account menu"
        aria-expanded={open}
      >
        {avatar ? (
          <Image src={avatar} alt="" width={40} height={40} className="h-full w-full object-cover" />
        ) : (
          <span className="font-headline text-xs font-bold text-primary">{talentInitials(name)}</span>
        )}
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-outline-variant bg-surface py-1 shadow-xl">
          <div className="border-b border-outline-variant px-4 py-3">
            <p className="truncate text-sm font-semibold text-on-surface">{name}</p>
            {username ? <p className="truncate text-xs text-on-surface-variant">@{username}</p> : null}
          </div>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onEditProfile();
            }}
            className="flex w-full px-4 py-2.5 text-left text-sm text-on-surface hover:bg-surface-container-high"
          >
            Edit profile
          </button>
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-high"
          >
            Settings
          </Link>
          <Link
            href={profileHref}
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-high"
          >
            View public profile
          </Link>
          <Link
            href="/services/new"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-high"
          >
            Create service
          </Link>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              void signOut();
            }}
            className="flex w-full border-t border-outline-variant px-4 py-2.5 text-left text-sm text-critical hover:bg-surface-container-high"
          >
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
