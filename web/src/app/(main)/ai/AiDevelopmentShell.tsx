"use client";

import Link from "next/link";

export function AiDevelopmentShell() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <p className="text-secondary font-headline text-[10px] font-black uppercase tracking-[0.28em]">Artificial intelligence</p>
      <h1 className="font-display text-on-surface mt-3 text-3xl font-bold tracking-tight">Under active development</h1>
      <p className="text-on-surface-variant mt-4 text-sm font-light leading-relaxed">
        Copilots, agents, and studio canvases are paused until the next shipping milestone. Core marketplace and deal chat
        remain fully available.
      </p>
      <Link
        href="/"
        className="bg-primary text-on-primary font-headline mt-10 inline-flex min-h-[48px] items-center rounded-xl px-6 text-xs font-black uppercase tracking-wider"
      >
        Back to home
      </Link>
    </div>
  );
}
