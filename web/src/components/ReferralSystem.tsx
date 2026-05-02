"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Copy, Check, Share2, Gift } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

interface ReferralStats {
  clicks: number;
  signups: number;
  completed_deals: number;
  rewards_earned: number;
  rewards_pending: number;
}

interface ReferralReward {
  type: "specialist_refers_client" | "client_refers_client" | "specialist_refers_specialist";
  description: string;
  reward: string;
  icon: string;
}

const rewards: ReferralReward[] = [
  {
    type: "specialist_refers_client",
    description: "Specialist refers a client who posts a brief",
    reward: "50% fee waiver on next completed deal",
    icon: "🎯",
  },
  {
    type: "client_refers_client",
    description: "Client refers another client who hires",
    reward: "$5 platform credit on next hire",
    icon: "💳",
  },
  {
    type: "specialist_refers_specialist",
    description: "Specialist refers another specialist",
    reward: "1 month Pro free when referred completes first deal",
    icon: "⭐",
  },
];

function generateReferralLink(username: string): string {
  return `https://brandforge.gg/join?ref=${encodeURIComponent(username)}`;
}

function generateWhatsAppShareText(username: string): string {
  const link = generateReferralLink(username);
  return `Hey — I've been using BrandForge to hire/get hired. It's way better than Upwork — escrow secured, AI-assisted, fair for both sides. Sign up with my link and we both get a bonus: ${link}`;
}

function generateTwitterShareText(username: string): string {
  const link = generateReferralLink(username);
  return `Just discovered @BrandForge_gg — the professional marketplace with escrow-secured deals and AI-assisted briefs. Way better than the alternatives. Join with my link: ${link}`;
}

function generateLinkedInShareText(username: string): string {
  const link = generateReferralLink(username);
  return `I've been using BrandForge for professional services and project briefs. It's the most fair platform I've found — escrow-secured, AI-assisted, transparent for both sides. If you're looking for verified specialists or want to offer your services, join with my referral link: ${link}`;
}

export function ReferralSystem() {
  const { session } = useAuth();
  const [username, setUsername] = useState<string>("");
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"link" | "rewards">("link");

  useEffect(() => {
    async function loadData() {
      if (!session?.user) {
        setLoading(false);
        return;
      }

      try {
        const supabase = getSupabaseBrowser();
        if (!supabase) return;

        // Get user profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", session.user.id)
          .single();

        if (profile?.username) {
          setUsername(profile.username);

          // Get referral stats
          const { data: statsData } = await supabase
            .from("referral_stats")
            .select("*")
            .eq("user_id", session.user.id)
            .single();

          if (statsData) {
            setStats(statsData);
          }
        }
      } catch (error) {
        console.error("Error loading referral data:", error);
      }
    }

    loadData();
  }, [session]);

  const referralLink = username ? generateReferralLink(username) : "";

  const handleCopy = useCallback(async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      // Track copy event
      const supabase = getSupabaseBrowser();
      if (supabase && session?.user) {
        await supabase.from("referral_events").insert({
          user_id: session.user.id,
          event_type: "link_copied",
          created_at: new Date().toISOString(),
        });
      }
    } catch {
      // Silent fail
    }
  }, [referralLink, session]);

  const handleShare = useCallback(
    async (platform: "whatsapp" | "twitter" | "linkedin") => {
      if (!username) return;

      let shareUrl = "";
      let text = "";

      switch (platform) {
        case "whatsapp":
          text = generateWhatsAppShareText(username);
          shareUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
          break;
        case "twitter":
          text = generateTwitterShareText(username);
          shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
          break;
        case "linkedin":
          text = generateLinkedInShareText(username);
          shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
            referralLink
          )}&summary=${encodeURIComponent(text)}`;
          break;
      }

      window.open(shareUrl, "_blank", "width=600,height=400");

      // Track share event
      const supabase = getSupabaseBrowser();
      if (supabase && session?.user) {
        try {
          await supabase
            .from("referral_events")
            .insert({
              user_id: session.user.id,
              event_type: "share",
              platform,
              created_at: new Date().toISOString(),
            });
        } catch {
          // Silent fail
        }
      }
    },
    [username, referralLink, session]
  );

  if (!session?.user) {
    return (
      <div className="rounded-xl border border-outline-variant bg-surface-container p-6 text-center">
        <Gift className="mx-auto mb-3 h-12 w-12 text-on-surface-variant" />
        <h3 className="text-lg font-semibold text-on-surface">Refer & Earn</h3>
        <p className="mt-2 text-sm text-on-surface-variant">
          Sign in to get your referral link and earn rewards when you invite others.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition hover:bg-primary/90"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-outline-variant bg-surface-container p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-6 w-32 rounded bg-surface-container-high" />
          <div className="h-10 rounded bg-surface-container-high" />
          <div className="h-20 rounded bg-surface-container-high" />
        </div>
      </div>
    );
  }

  if (!username) {
    return (
      <div className="rounded-xl border border-outline-variant bg-surface-container p-6 text-center">
        <h3 className="text-lg font-semibold text-on-surface">Set up your username</h3>
        <p className="mt-2 text-sm text-on-surface-variant">
          You need a username to create a referral link.
        </p>
        <Link
          href="/settings"
          className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition hover:bg-primary/90"
        >
          Go to Settings
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container">
      {/* Tabs */}
      <div className="flex border-b border-outline-variant">
        <button
          onClick={() => setActiveTab("link")}
          className={`flex-1 px-4 py-3 text-sm font-medium transition ${
            activeTab === "link"
              ? "border-b-2 border-primary text-primary"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Share Link
        </button>
        <button
          onClick={() => setActiveTab("rewards")}
          className={`flex-1 px-4 py-3 text-sm font-medium transition ${
            activeTab === "rewards"
              ? "border-b-2 border-primary text-primary"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Rewards {stats && `(${stats.rewards_earned})`}
        </button>
      </div>

      <div className="p-6">
        {activeTab === "link" ? (
          <div className="space-y-4">
            {/* Referral Link */}
            <div>
              <label className="mb-2 block text-sm font-medium text-on-surface">Your Referral Link</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={referralLink}
                  className="flex-1 rounded-lg border border-outline-variant bg-surface-container-high px-3 py-2 text-sm text-on-surface focus:outline-none"
                />
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 rounded-lg bg-surface-container-high px-4 py-2 text-sm font-medium text-on-surface transition hover:bg-surface-container-highest"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            {/* Share Buttons */}
            <div>
              <label className="mb-2 block text-sm font-medium text-on-surface">Share</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleShare("whatsapp")}
                  className="flex items-center gap-2 rounded-lg bg-[#25d366] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#128c7e]"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </button>
                <button
                  onClick={() => handleShare("twitter")}
                  className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  X / Twitter
                </button>
                <button
                  onClick={() => handleShare("linkedin")}
                  className="flex items-center gap-2 rounded-lg bg-[#0077b5] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#005885]"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  LinkedIn
                </button>
              </div>
            </div>

            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-2 gap-3 pt-4 sm:grid-cols-4">
                <div className="rounded-lg bg-surface-container-high p-3 text-center">
                  <div className="text-2xl font-bold text-on-surface">{stats.clicks}</div>
                  <div className="text-xs text-on-surface-variant">Clicks</div>
                </div>
                <div className="rounded-lg bg-surface-container-high p-3 text-center">
                  <div className="text-2xl font-bold text-primary">{stats.signups}</div>
                  <div className="text-xs text-on-surface-variant">Signups</div>
                </div>
                <div className="rounded-lg bg-surface-container-high p-3 text-center">
                  <div className="text-2xl font-bold text-emerald-500">{stats.completed_deals}</div>
                  <div className="text-xs text-on-surface-variant">Deals</div>
                </div>
                <div className="rounded-lg bg-surface-container-high p-3 text-center">
                  <div className="text-2xl font-bold text-amber-500">${stats.rewards_earned}</div>
                  <div className="text-xs text-on-surface-variant">Earned</div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-on-surface-variant">
              Earn rewards when you refer others to BrandForge. Rewards are automatically applied to your account.
            </p>

            <div className="space-y-3">
              {rewards.map((reward) => (
                <div
                  key={reward.type}
                  className="flex items-start gap-3 rounded-lg bg-surface-container-high p-3"
                >
                  <span className="text-2xl">{reward.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium text-on-surface">{reward.description}</p>
                    <p className="text-sm text-on-surface-variant">You get: {reward.reward}</p>
                  </div>
                </div>
              ))}
            </div>

            {stats && stats.rewards_pending > 0 && (
              <div className="rounded-lg bg-amber-500/10 p-3">
                <p className="text-sm">
                  <span className="font-semibold text-amber-600">${stats.rewards_pending} pending:</span>{" "}
                  <span className="text-on-surface-variant">
                    Rewards will be credited when referred users complete their first deals.
                  </span>
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
