import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function StudioLayout({ children }: { children: ReactNode }) {
  void children;
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <p className="text-secondary font-headline text-[10px] font-black uppercase tracking-[0.28em]">Studio</p>
      <h1 className="font-display text-on-surface mt-3 text-3xl font-bold tracking-tight">Under active development</h1>
      <p className="text-on-surface-variant mt-4 text-sm font-light leading-relaxed">
        The visual studio is bundled with the AI roadmap and will return with the next release wave.
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
