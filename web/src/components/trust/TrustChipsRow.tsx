import { cn } from "@/lib/cn";

type Props = {
  /** Average star rating (1–5). */
  rating?: number | null;
  kycVerified?: boolean;
  /** Closed deals (escrow released) — both parties get a win. */
  dealWins?: number | null;
  /** Deals cancelled after terms were in motion — counts for both parties. */
  dealLosses?: number | null;
  className?: string;
};

/**
 * Shared trust signals for **public profile** and **leaderboard** so copy and tokens stay aligned (Phase 6).
 */
export function TrustChipsRow({ rating, kycVerified, dealWins, dealLosses, className }: Props) {
  const wins = dealWins != null ? Number(dealWins) : 0;
  const losses = dealLosses != null ? Number(dealLosses) : 0;
  const showDeal =
    (Number.isFinite(wins) && wins > 0) || (Number.isFinite(losses) && losses > 0);
  const rt = rating != null ? Number(rating) : null;

  if ((rt == null || !Number.isFinite(rt)) && !kycVerified && !showDeal) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {rt != null && Number.isFinite(rt) ? (
        <span className="border-outline-variant/25 bg-surface-container-high/50 text-on-surface inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider">
          <span className="material-symbols-outlined text-primary text-sm" aria-hidden>
            star
          </span>
          {rt.toFixed(1)} avg
        </span>
      ) : null}
      {kycVerified ? (
        <span className="border-secondary-container/35 bg-secondary/10 text-secondary inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider">
          <span
            className="material-symbols-outlined text-sm"
            style={{ fontVariationSettings: "'FILL' 1" }}
            aria-hidden
          >
            verified
          </span>
          Verified
        </span>
      ) : null}
      {showDeal ? (
        <span
          className="border-outline-variant/25 text-on-surface-variant inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
          title="Deal record: wins when escrow completes; mutual drops when a live contract is cancelled before payout."
        >
          <span className="material-symbols-outlined text-sm opacity-80" aria-hidden>
            handshake
          </span>
          Deals {Number.isFinite(wins) ? wins : 0}–{Number.isFinite(losses) ? losses : 0}
        </span>
      ) : null}
    </div>
  );
}
