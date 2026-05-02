"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Copy, Check } from "lucide-react";

interface DealWinData {
  specialistName: string;
  tier: string;
  serviceTitle: string;
  rating: number;
  dealValue?: number;
  username: string;
  completedAt: string;
}

interface ShareWinModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal: DealWinData;
}

function getTierBadge(tier: string): { emoji: string; color: string } {
  switch (tier.toLowerCase()) {
    case "elite":
      return { emoji: "👑", color: "#FFD700" };
    case "pro":
      return { emoji: "⭐", color: "#C0C0C0" };
    case "expert":
      return { emoji: "🎯", color: "#CD7F32" };
    default:
      return { emoji: "🔷", color: "#64748b" };
  }
}

function generateShareText(deal: DealWinData, platform: "linkedin" | "twitter"): string {
  const tierBadge = getTierBadge(deal.tier);
  const chronicleUrl = `https://brandforge.gg/u/${encodeURIComponent(deal.username)}`;

  if (platform === "linkedin") {
    return `Just closed another verified deal on @BrandForge 🚀

${deal.serviceTitle} · ${tierBadge.emoji} ${deal.tier} · ${deal.rating.toFixed(1)}⭐ rating

Every project I take is scope-locked and escrow-secured.

${chronicleUrl}

#BrandForge #FreelanceWin #ProfessionalServices`;
  }

  // Twitter/X - shorter format
  return `Shipped another one ✅

${deal.serviceTitle.slice(0, 50)}${deal.serviceTitle.length > 50 ? "..." : ""}

${tierBadge.emoji} on @BrandForge_gg
Scope locked. Escrow secured. Client happy.

${chronicleUrl}`;
}

function generateWhatsAppText(deal: DealWinData, refCode: string): string {
  return `Hey — I've been using BrandForge to get hired for professional work.

It's way better than Upwork — escrow secured, AI-assisted, fair for both sides.

Sign up with my link and we both get a bonus:
https://brandforge.gg/join?ref=${refCode}`;
}

export function ShareWinModal({ isOpen, onClose, deal }: ShareWinModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"linkedin" | "twitter" | "link">("linkedin");
  const tierBadge = getTierBadge(deal.tier);

  const ogImageUrl = `https://brandforge.gg/api/og/win?name=${encodeURIComponent(
    deal.specialistName
  )}&tier=${encodeURIComponent(deal.tier)}&service=${encodeURIComponent(
    deal.serviceTitle
  )}&rating=${deal.rating}&verified=true`;

  const chronicleUrl = `https://brandforge.gg/u/${encodeURIComponent(deal.username)}`;

  const handleShare = useCallback(
    (platform: "linkedin" | "twitter") => {
      const text = generateShareText(deal, platform);
      const url = encodeURIComponent(chronicleUrl);
      const ogImage = encodeURIComponent(ogImageUrl);

      let shareUrl = "";
      if (platform === "linkedin") {
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}&summary=${encodeURIComponent(text)}`;
      } else {
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
      }

      window.open(shareUrl, "_blank", "width=600,height=400");
    },
    [deal, chronicleUrl, ogImageUrl]
  );

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(chronicleUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silent fail
    }
  }, [chronicleUrl]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-surface-container shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant p-4">
          <div>
            <h2 className="text-lg font-semibold text-on-surface">🎉 Share Your Win</h2>
            <p className="text-sm text-on-surface-variant">Celebrate this milestone with your network</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-on-surface-variant transition hover:bg-surface-container-high"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Preview Card */}
        <div className="p-4">
          <div className="mb-4 overflow-hidden rounded-xl border border-outline-variant">
            <div className="relative aspect-[1200/630] w-full bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900">
              {/* OG Image Preview */}
              <Image src={ogImageUrl} alt="Share preview" fill className="object-cover" />
            </div>
            <div className="border-t border-outline-variant bg-surface-container-low p-3">
              <div className="flex items-center gap-2">
                <span style={{ color: tierBadge.color }}>{tierBadge.emoji}</span>
                <span className="font-medium text-on-surface">{deal.specialistName}</span>
                <span className="text-on-surface-variant">·</span>
                <span className="text-sm text-on-surface-variant">{deal.tier}</span>
              </div>
              <p className="mt-1 text-sm text-on-surface-variant line-clamp-2">{deal.serviceTitle}</p>
              <div className="mt-2 flex items-center gap-1 text-amber-400">
                <span>{"★".repeat(Math.floor(deal.rating))}</span>
                <span className="text-sm text-on-surface-variant">{deal.rating.toFixed(1)}</span>
              </div>
            </div>
          </div>

          {/* Share Options */}
          <div className="space-y-3">
            {/* Platform Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("linkedin")}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
                  activeTab === "linkedin"
                    ? "bg-[#0077b5] text-white"
                    : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"
                }`}
              >
                <svg className="mr-2 inline h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                LinkedIn
              </button>
              <button
                onClick={() => setActiveTab("twitter")}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
                  activeTab === "twitter"
                    ? "bg-black text-white"
                    : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"
                }`}
              >
                <svg className="mr-2 inline h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                X / Twitter
              </button>
            </div>

            {/* Preview Text */}
            <div className="rounded-lg bg-surface-container-high p-3">
              <p className="whitespace-pre-wrap text-sm text-on-surface-variant">
                {generateShareText(deal, activeTab === "linkedin" ? "linkedin" : "twitter")}
              </p>
            </div>

            {/* Share Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => handleShare(activeTab === "linkedin" ? "linkedin" : "twitter")}
                className="flex-1 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-on-primary transition hover:bg-primary/90"
              >
                Post to {activeTab === "linkedin" ? "LinkedIn" : "X"}
              </button>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 rounded-lg bg-surface-container-high px-4 py-3 text-sm font-medium text-on-surface transition hover:bg-surface-container-highest"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied!" : "Copy Link"}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-outline-variant bg-surface-container-low p-4">
          <p className="text-center text-xs text-on-surface-variant">
            Sharing helps you build your reputation and attracts new clients.{" "}
            <Link href="/help/sharing" className="text-primary hover:underline">
              Learn more
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// Hook for triggering share modal after deal completion
export function useShareWin() {
  const [isOpen, setIsOpen] = useState(false);
  const [dealData, setDealData] = useState<DealWinData | null>(null);

  const openShareWin = useCallback((deal: DealWinData) => {
    setDealData(deal);
    setIsOpen(true);
  }, []);

  const closeShareWin = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => setDealData(null), 300);
  }, []);

  return {
    ShareWinModal: dealData ? (
      <ShareWinModal isOpen={isOpen} onClose={closeShareWin} deal={dealData} />
    ) : null,
    openShareWin,
    closeShareWin,
    isOpen,
  };
}
