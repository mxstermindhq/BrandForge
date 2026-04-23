import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Payment",
  robots: { index: false, follow: false },
};

export default function PaymentCancelledPage() {
  return (
    <div className="bg-background text-on-surface flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="max-w-md text-center">
        <p className="font-headline text-secondary text-xs font-bold uppercase tracking-[0.2em]">Stripe</p>
        <h1 className="font-display mt-3 text-2xl font-bold tracking-tight">Payment cancelled</h1>
        <p className="text-on-surface-variant mt-3 text-sm font-light leading-relaxed">
          You left checkout before completing payment. No charge was made. You can return to the request and try again
          when ready.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/marketplace"
            className="bg-primary text-on-primary font-headline inline-flex min-h-11 items-center justify-center rounded-xl px-5 text-sm font-bold transition-opacity hover:opacity-90"
          >
            Return to marketplace
          </Link>
          <Link
            href="/"
            className="border-outline-variant/40 font-headline text-on-surface hover:bg-surface-container-high inline-flex min-h-11 items-center justify-center rounded-xl border px-5 text-sm font-bold"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
