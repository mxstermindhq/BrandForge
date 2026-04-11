import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Bid",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function firstParam(v: string | string[] | undefined): string | undefined {
  if (v == null) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

/** Legacy `/bid?request=` / `/bid?service=` → dedicated routes. */
export default async function BidHubPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const req = firstParam(sp.request)?.trim();
  const svc = firstParam(sp.service)?.trim();
  if (req) redirect(`/bid/request?id=${encodeURIComponent(req)}`);
  if (svc) redirect(`/bid/service?id=${encodeURIComponent(svc)}`);

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="font-display text-on-surface text-2xl font-bold tracking-tight">Place a bid</h1>
      <p className="text-on-surface-variant mt-4 text-sm leading-relaxed">
        Request bids apply to posted briefs. Service bids apply to fixed-price packages. Open a listing and use{" "}
        <strong className="text-on-surface">Bid</strong> to reach the right form.
      </p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/requests"
          className="bg-primary text-on-primary font-headline inline-flex min-h-12 items-center justify-center rounded-xl px-6 text-sm font-bold"
        >
          Browse requests
        </Link>
        <Link
          href="/services"
          className="border-outline-variant/40 text-on-surface hover:bg-surface-container-high font-headline inline-flex min-h-12 items-center justify-center rounded-xl border px-6 text-sm font-bold"
        >
          Browse services
        </Link>
      </div>
    </div>
  );
}
