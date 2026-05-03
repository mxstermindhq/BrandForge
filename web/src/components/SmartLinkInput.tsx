"use client";

import { useState } from "react";
import { Link2, Sparkles, Loader2 } from "lucide-react";

interface SmartLinkInputProps {
  onAdd: (url: string, metadata: { title: string; description: string }) => void;
  disabled?: boolean;
}

export function SmartLinkInput({ onAdd, disabled }: SmartLinkInputProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const extractMetadata = async (inputUrl: string) => {
    setLoading(true);
    try {
      // Simple URL validation
      let cleanUrl = inputUrl.trim();
      if (!cleanUrl.startsWith("http")) {
        cleanUrl = "https://" + cleanUrl;
      }

      // Try to fetch metadata via a simple proxy or API
      // For now, extract info from URL patterns
      const urlObj = new URL(cleanUrl);
      const hostname = urlObj.hostname.replace(/^www\./, "");
      
      // Generate smart title based on URL
      let title = "External Link";
      let description = `Link from ${hostname}`;

      // Pattern matching for common platforms
      if (hostname.includes("github.com")) {
        const pathParts = urlObj.pathname.split("/").filter(Boolean);
        if (pathParts.length >= 2) {
          title = `GitHub: ${pathParts[1]}`;
          description = `Repository by ${pathParts[0]}`;
        }
      } else if (hostname.includes("figma.com")) {
        title = "Figma Design";
        description = "View design on Figma";
      } else if (hostname.includes("dribbble.com")) {
        title = "Dribbble Shot";
        description = "View on Dribbble";
      } else if (hostname.includes("behance.net")) {
        title = "Behance Project";
        description = "View project on Behance";
      } else if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
        title = "YouTube Video";
        description = "Watch video on YouTube";
      } else if (hostname.includes("vimeo.com")) {
        title = "Vimeo Video";
        description = "Watch video on Vimeo";
      } else if (hostname.includes("linkedin.com")) {
        title = "LinkedIn Post";
        description = "View on LinkedIn";
      } else if (hostname.includes("twitter.com") || hostname.includes("x.com")) {
        title = "X Post";
        description = "View post on X";
      } else if (hostname.includes("medium.com")) {
        title = "Medium Article";
        description = "Read on Medium";
      } else if (hostname.includes("notion.so")) {
        title = "Notion Page";
        description = "View on Notion";
      }

      onAdd(cleanUrl, { title, description });
      setUrl("");
    } catch (e) {
      // Invalid URL
      alert("Please enter a valid URL");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste external link (GitHub, Figma, Dribbble...)"
            disabled={disabled || loading}
            onKeyDown={(e) => e.key === "Enter" && url && extractMetadata(url)}
            className="w-full rounded-lg border border-outline-variant bg-surface-container-high pl-9 pr-4 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <button
          onClick={() => url && extractMetadata(url)}
          disabled={disabled || loading || !url}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-on-primary transition hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Smart Add</span>
            </>
          )}
        </button>
      </div>
      <p className="text-xs text-on-surface-variant">
        Supports: GitHub, Figma, Dribbble, Behance, YouTube, LinkedIn, X, Medium, Notion
      </p>
    </div>
  );
}
